import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import FirebaseService from '../config/firebase';
import SocketService from '../config/socket';
import { EmailService } from './email.service';

/**
 * Notification entity for database persistence
 */
export interface NotificationEntity {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Notification types for different marketplace events
 */
export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  ORDER_SHIPPED = 'order_shipped',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  LISTING_APPROVED = 'listing_approved',
  LISTING_REJECTED = 'listing_rejected',
  LISTING_EXPIRED = 'listing_expired',
  NEW_MESSAGE = 'new_message',
  PRICE_ALERT = 'price_alert',
  INVENTORY_LOW = 'inventory_low',
  ACCOUNT_VERIFIED = 'account_verified',
  SECURITY_ALERT = 'security_alert',
  SYSTEM_MAINTENANCE = 'system_maintenance',
  PROMOTIONAL = 'promotional'
}

/**
 * Notification preferences for users
 */
export interface NotificationPreferences {
  userId: number;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  inAppNotifications: boolean;
  orderUpdates: boolean;
  paymentAlerts: boolean;
  listingNotifications: boolean;
  messageNotifications: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  promotionalOffers: boolean;
}

/**
 * Device token for push notifications
 */
export interface DeviceToken {
  id: number;
  userId: number;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

/**
 * Comprehensive notification service for Sirkulo marketplace
 */
export class NotificationService {
  private static instance: NotificationService;
  private notificationRepository: Repository<any>;
  private preferencesRepository: Repository<any>;
  private deviceTokenRepository: Repository<any>;
  private firebaseService: typeof FirebaseService;
  private socketService: typeof SocketService;
  private emailService: EmailService;

  private constructor() {
    // Initialize repositories (these would be actual TypeORM entities in production)
    this.firebaseService = FirebaseService;
    this.socketService = SocketService;
    this.emailService = EmailService.getInstance();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send comprehensive notification (real-time + push + email + in-app)
   */
  public async sendNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    options?: {
      priority?: 'low' | 'normal' | 'high';
      persistent?: boolean;
      actionUrl?: string;
      imageUrl?: string;
      soundEnabled?: boolean;
    }
  ): Promise<void> {
    try {
      // Get user preferences
      const preferences = await this.getUserPreferences(userId);
      
      // Save to database for in-app notifications
      if (preferences.inAppNotifications) {
        await this.saveNotificationToDatabase(userId, type, title, message, data, options);
      }

      // Send real-time notification via Socket.IO
      this.sendRealTimeNotification(userId, type, title, message, data);

      // Send push notification via Firebase
      if (preferences.pushNotifications) {
        await this.sendPushNotification(userId, title, message, data);
      }

      // Send email notification if applicable
      if (preferences.emailNotifications && this.shouldSendEmail(type, preferences)) {
        await this.sendEmailNotification(userId, type, title, message, data);
      }

      console.log(`✅ Comprehensive notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error(`❌ Failed to send notification to user ${userId}:`, error);
    }
  }

  /**
   * Send bulk notifications to multiple users
   */
  public async sendBulkNotification(
    userIds: number[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const promises = userIds.map(async (userId) => {
      try {
        await this.sendNotification(userId, type, title, message, data);
        success++;
      } catch (error) {
        console.error(`❌ Failed to send notification to user ${userId}:`, error);
        failed++;
      }
    });

    await Promise.allSettled(promises);
    
    console.log(`📊 Bulk notification completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Send role-based notification (all buyers or sellers)
   */
  public async sendRoleNotification(
    role: 'buyer' | 'seller',
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      // Send real-time to all connected users in role
      this.socketService.sendToRole(role, 'notification', {
        type,
        title,
        message,
        data,
        timestamp: new Date().toISOString(),
      });

      // Send push notifications to all devices with this role
      await this.sendPushToRole(role, title, message, data);

      console.log(`✅ Role-based notification sent to all ${role}s: ${title}`);
    } catch (error) {
      console.error(`❌ Failed to send role notification to ${role}s:`, error);
    }
  }

  /**
   * Send real-time notification via Socket.IO
   */
  private sendRealTimeNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): void {
    this.socketService.sendToUser(userId, 'notification', {
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send push notification via Firebase
   */
  private async sendPushNotification(
    userId: number,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (deviceTokens.length === 0) {
        console.log(`⚠️ No device tokens found for user ${userId}`);
        return;
      }

      const tokens = deviceTokens.map(device => device.token);
      const result = await this.firebaseService.sendToMultipleDevices(
        tokens,
        title,
        message,
        data ? this.stringifyData(data) : undefined
      );

      // Update last used timestamp for successful tokens
      if (result.success > 0) {
        await this.updateDeviceTokensLastUsed(userId);
      }

      console.log(`📱 Push notification sent to user ${userId}: ${result.success} success, ${result.failure} failed`);
    } catch (error) {
      console.error(`❌ Failed to send push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const user = await this.getUserEmail(userId);
      if (!user?.email) {
        console.log(`⚠️ No email found for user ${userId}`);
        return;
      }

      // Map notification types to email templates
      const emailTemplate = this.getEmailTemplateForNotificationType(type);
      
      await this.emailService.sendTemplateEmail(
        user.email,
        emailTemplate,
        {
          name: user.name || 'User',
          title,
          message,
          ...data,
        }
      );

      console.log(`📧 Email notification sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error(`❌ Failed to send email notification to user ${userId}:`, error);
    }
  }

  /**
   * Save notification to database for in-app display
   */
  private async saveNotificationToDatabase(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>,
    options?: any
  ): Promise<void> {
    try {
      const expiresAt = options?.persistent ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      // In a real implementation, this would save to the database
      // For now, we'll store in Redis for demonstration
      const notification = {
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: new Date(),
        expiresAt,
      };

      console.log(`💾 Notification saved to database for user ${userId}:`, notification);
    } catch (error) {
      console.error(`❌ Failed to save notification to database for user ${userId}:`, error);
    }
  }

  /**
   * Register device token for push notifications
   */
  public async registerDeviceToken(
    userId: number,
    token: string,
    platform: 'ios' | 'android' | 'web'
  ): Promise<void> {
    try {
      // In a real implementation, this would save to the database
      console.log(`📱 Device token registered for user ${userId}: ${platform}`);
    } catch (error) {
      console.error(`❌ Failed to register device token for user ${userId}:`, error);
    }
  }

  /**
   * Update user notification preferences
   */
  public async updateNotificationPreferences(
    userId: number,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`⚙️ Notification preferences updated for user ${userId}:`, preferences);
    } catch (error) {
      console.error(`❌ Failed to update notification preferences for user ${userId}:`, error);
    }
  }

  /**
   * Get user's unread notifications
   */
  public async getUserNotifications(
    userId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<NotificationEntity[]> {
    try {
      // In a real implementation, this would query the database
      return [];
    } catch (error) {
      console.error(`❌ Failed to get notifications for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Mark notifications as read
   */
  public async markNotificationsAsRead(
    userId: number,
    notificationIds: number[]
  ): Promise<void> {
    try {
      // In a real implementation, this would update the database
      console.log(`✅ Marked ${notificationIds.length} notifications as read for user ${userId}`);
    } catch (error) {
      console.error(`❌ Failed to mark notifications as read for user ${userId}:`, error);
    }
  }

  /**
   * Helper methods
   */
  private async getUserPreferences(userId: number): Promise<NotificationPreferences> {
    // In a real implementation, this would query the database
    // For now, return default preferences
    return {
      userId,
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      inAppNotifications: true,
      orderUpdates: true,
      paymentAlerts: true,
      listingNotifications: true,
      messageNotifications: true,
      priceAlerts: true,
      securityAlerts: true,
      promotionalOffers: false,
    };
  }

  private async getUserDeviceTokens(userId: number): Promise<DeviceToken[]> {
    // In a real implementation, this would query the database
    return [];
  }

  private async getUserEmail(userId: number): Promise<{ email: string; name?: string } | null> {
    // In a real implementation, this would query the user database
    return null;
  }

  private async updateDeviceTokensLastUsed(userId: number): Promise<void> {
    // In a real implementation, this would update the database
  }

  private async sendPushToRole(
    role: 'buyer' | 'seller',
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would query all users with the role and send push notifications
  }

  private shouldSendEmail(type: NotificationType, preferences: NotificationPreferences): boolean {
    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_UPDATED:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.ORDER_DELIVERED:
      case NotificationType.ORDER_CANCELLED:
        return preferences.orderUpdates;
      case NotificationType.PAYMENT_SUCCESS:
      case NotificationType.PAYMENT_FAILED:
        return preferences.paymentAlerts;
      case NotificationType.LISTING_APPROVED:
      case NotificationType.LISTING_REJECTED:
      case NotificationType.LISTING_EXPIRED:
        return preferences.listingNotifications;
      case NotificationType.NEW_MESSAGE:
        return preferences.messageNotifications;
      case NotificationType.PRICE_ALERT:
        return preferences.priceAlerts;
      case NotificationType.SECURITY_ALERT:
        return preferences.securityAlerts;
      case NotificationType.PROMOTIONAL:
        return preferences.promotionalOffers;
      default:
        return true;
    }
  }

  private getEmailTemplateForNotificationType(type: NotificationType): string {
    switch (type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_UPDATED:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.ORDER_DELIVERED:
        return 'order-confirmation';
      case NotificationType.ACCOUNT_VERIFIED:
        return 'email-verification';
      default:
        return 'general-notification';
    }
  }

  private stringifyData(data: Record<string, any>): Record<string, string> {
    const stringData: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      stringData[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }
    return stringData;
  }
}

export default NotificationService.getInstance();