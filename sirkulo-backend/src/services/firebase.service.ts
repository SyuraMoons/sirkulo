import admin from 'firebase-admin';
import config from '../config';

/**
 * Firebase push notification data interface
 */
interface NotificationData {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  action?: string;
  userId?: string;
}

/**
 * Device token interface
 */
interface DeviceToken {
  token: string;
  platform: 'android' | 'ios' | 'web';
  userId: string;
}

/**
 * Firebase Admin SDK service for push notifications
 */
class FirebaseService {
  private initialized = false;

  /**
   * Initialize Firebase Admin SDK
   */
  private async initializeFirebase(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Check if Firebase app is already initialized
      if (admin.apps.length === 0) {
        const serviceAccount = {
          projectId: config.firebase.projectId,
          clientEmail: config.firebase.clientEmail,
          privateKey: config.firebase.privateKey.replace(/\\n/g, '\n'),
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: config.firebase.projectId,
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
      throw new Error('Failed to initialize Firebase Admin SDK');
    }
  }

  /**
   * Send push notification to a single device
   */
  async sendToDevice(
    token: string,
    notification: NotificationData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      await this.initializeFirebase();

      const message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          ...notification.data,
          action: notification.action || 'default',
          userId: notification.userId || '',
          timestamp: new Date().toISOString(),
        },
        android: {
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high' as const,
            defaultSound: true,
            defaultVibrateTimings: true,
            defaultLightSettings: true,
          },
          data: notification.data,
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: 1,
              sound: 'default',
              'content-available': 1,
            },
          },
          headers: {
            'apns-priority': '10',
            'apns-push-type': 'alert',
          },
        },
        webpush: {
          notification: {
            title: notification.title,
            body: notification.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            image: notification.imageUrl,
            requireInteraction: true,
            actions: [
              {
                action: 'view',
                title: 'View',
              },
              {
                action: 'dismiss',
                title: 'Dismiss',
              },
            ],
          },
        },
      };

      const response = await admin.messaging().send(message);
      
      console.log('📱 Push notification sent successfully:', response);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('❌ Push notification error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send push notification' 
      };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendToMultipleDevices(
    tokens: string[],
    notification: NotificationData
  ): Promise<{ 
    success: boolean; 
    successCount: number; 
    failureCount: number; 
    responses: any[] 
  }> {
    try {
      await this.initializeFirebase();

      if (tokens.length === 0) {
        return { success: false, successCount: 0, failureCount: 0, responses: [] };
      }

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          ...notification.data,
          action: notification.action || 'default',
          userId: notification.userId || '',
          timestamp: new Date().toISOString(),
        },
        android: {
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high' as const,
            defaultSound: true,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: 1,
              sound: 'default',
            },
          },
        },
        tokens,
      };

      const response = await admin.messaging().sendMulticast(message);
      
      console.log(`📱 Multicast notification sent - Success: ${response.successCount}, Failed: ${response.failureCount}`);
      
      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error: any) {
      console.error('❌ Multicast push notification error:', error);
      return { 
        success: false, 
        successCount: 0, 
        failureCount: tokens.length, 
        responses: []
      };
    }
  }

  /**
   * Send notification to a topic
   */
  async sendToTopic(
    topic: string,
    notification: NotificationData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      await this.initializeFirebase();

      const message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: {
          ...notification.data,
          action: notification.action || 'default',
          timestamp: new Date().toISOString(),
        },
        android: {
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      
      console.log(`📱 Topic notification sent to "${topic}":`, response);
      return { success: true, messageId: response };
    } catch (error: any) {
      console.error('❌ Topic notification error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send topic notification' 
      };
    }
  }

  /**
   * Subscribe device token to topic
   */
  async subscribeToTopic(
    tokens: string | string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initializeFirebase();

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      await admin.messaging().subscribeToTopic(tokenArray, topic);
      
      console.log(`📱 Subscribed ${tokenArray.length} device(s) to topic "${topic}"`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Topic subscription error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to subscribe to topic' 
      };
    }
  }

  /**
   * Unsubscribe device token from topic
   */
  async unsubscribeFromTopic(
    tokens: string | string[],
    topic: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initializeFirebase();

      const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
      await admin.messaging().unsubscribeFromTopic(tokenArray, topic);
      
      console.log(`📱 Unsubscribed ${tokenArray.length} device(s) from topic "${topic}"`);
      return { success: true };
    } catch (error: any) {
      console.error('❌ Topic unsubscription error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to unsubscribe from topic' 
      };
    }
  }

  /**
   * Validate FCM token
   */
  async validateToken(token: string): Promise<{ valid: boolean; error?: string }> {
    try {
      await this.initializeFirebase();

      // Send a test message to validate the token
      const testMessage = {
        token,
        data: {
          test: 'validation',
        },
        dryRun: true, // Don't actually send the message
      };

      await admin.messaging().send(testMessage);
      return { valid: true };
    } catch (error: any) {
      console.error('❌ Token validation error:', error);
      return { 
        valid: false, 
        error: error.message || 'Invalid FCM token' 
      };
    }
  }

  /**
   * Send welcome notification to new user
   */
  async sendWelcomeNotification(token: string, userName: string): Promise<void> {
    await this.sendToDevice(token, {
      title: 'Welcome to Sirkulo! 🎉',
      body: `Hi ${userName}! Start exploring amazing products and connect with sellers in your area.`,
      data: {
        type: 'welcome',
        screen: 'home',
      },
      action: 'view_home',
    });
  }

  /**
   * Send order status notification
   */
  async sendOrderNotification(
    token: string,
    orderId: string,
    status: string,
    message: string
  ): Promise<void> {
    const statusEmojis: Record<string, string> = {
      pending: '⏳',
      confirmed: '✅',
      shipped: '🚚',
      delivered: '📦',
      cancelled: '❌',
    };

    await this.sendToDevice(token, {
      title: `Order ${statusEmojis[status] || '📋'} ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      body: message,
      data: {
        type: 'order_update',
        orderId,
        status,
        screen: 'order_details',
      },
      action: 'view_order',
    });
  }

  /**
   * Send new listing notification to interested users
   */
  async sendNewListingNotification(
    tokens: string[],
    listingTitle: string,
    category: string,
    price: string
  ): Promise<void> {
    await this.sendToMultipleDevices(tokens, {
      title: 'New Listing Available! 🆕',
      body: `${listingTitle} in ${category} - Starting at ${price}`,
      data: {
        type: 'new_listing',
        category,
        screen: 'listing_details',
      },
      action: 'view_listing',
    });
  }

  /**
   * Send chat message notification
   */
  async sendChatNotification(
    token: string,
    senderName: string,
    message: string,
    chatId: string
  ): Promise<void> {
    await this.sendToDevice(token, {
      title: `💬 ${senderName}`,
      body: message.length > 50 ? `${message.substring(0, 47)}...` : message,
      data: {
        type: 'chat_message',
        chatId,
        senderId: senderName,
        screen: 'chat',
      },
      action: 'view_chat',
    });
  }
}

export default new FirebaseService();
