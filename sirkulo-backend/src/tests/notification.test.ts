import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { NotificationService, NotificationType } from '../services/notification.service';
import SocketService from '../config/socket';
import FirebaseService from '../config/firebase';
import { EmailService } from '../services/email.service';

// Mock dependencies
jest.mock('../config/socket');
jest.mock('../config/firebase');
jest.mock('../services/email.service');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockSocketService: jest.Mocked<typeof SocketService>;
  let mockFirebaseService: jest.Mocked<typeof FirebaseService>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    // Initialize mocks
    mockSocketService = SocketService as jest.Mocked<typeof SocketService>;
    mockFirebaseService = FirebaseService as jest.Mocked<typeof FirebaseService>;
    mockEmailService = EmailService.getInstance() as jest.Mocked<EmailService>;

    // Initialize notification service
    notificationService = NotificationService.getInstance();
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('sendNotification', () => {
    const mockUserId = 1;
    const mockTitle = 'Test Notification';
    const mockMessage = 'This is a test notification';
    const mockData = { orderId: 123 };

    beforeEach(() => {
      // Mock user preferences to enable all notifications
      jest.spyOn(notificationService as any, 'getUserPreferences').mockResolvedValue({
        userId: mockUserId,
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
      });

      // Mock other private methods
      jest.spyOn(notificationService as any, 'saveNotificationToDatabase').mockResolvedValue(undefined);
      jest.spyOn(notificationService as any, 'sendPushNotification').mockResolvedValue(undefined);
      jest.spyOn(notificationService as any, 'sendEmailNotification').mockResolvedValue(undefined);
      jest.spyOn(notificationService as any, 'shouldSendEmail').mockReturnValue(true);
    });

    it('should send comprehensive notification successfully', async () => {
      // Mock Socket.IO sendToUser
      mockSocketService.sendToUser.mockReturnValue(true);

      await notificationService.sendNotification(
        mockUserId,
        NotificationType.ORDER_CREATED,
        mockTitle,
        mockMessage,
        mockData
      );

      // Verify real-time notification sent
      expect(mockSocketService.sendToUser).toHaveBeenCalledWith(
        mockUserId,
        'notification',
        {
          type: NotificationType.ORDER_CREATED,
          title: mockTitle,
          message: mockMessage,
          data: mockData,
          timestamp: expect.any(String),
        }
      );

      // Verify private methods were called
      expect(notificationService['getUserPreferences']).toHaveBeenCalledWith(mockUserId);
      expect(notificationService['saveNotificationToDatabase']).toHaveBeenCalled();
      expect(notificationService['sendPushNotification']).toHaveBeenCalled();
      expect(notificationService['sendEmailNotification']).toHaveBeenCalled();
    });

    it('should handle notification preferences correctly', async () => {
      // Mock user preferences with push notifications disabled
      jest.spyOn(notificationService as any, 'getUserPreferences').mockResolvedValue({
        userId: mockUserId,
        pushNotifications: false,
        emailNotifications: false,
        inAppNotifications: true,
        orderUpdates: false,
      });

      mockSocketService.sendToUser.mockReturnValue(true);

      await notificationService.sendNotification(
        mockUserId,
        NotificationType.ORDER_CREATED,
        mockTitle,
        mockMessage,
        mockData
      );

      // Should still send real-time notification
      expect(mockSocketService.sendToUser).toHaveBeenCalled();
      
      // Should save to database (in-app enabled)
      expect(notificationService['saveNotificationToDatabase']).toHaveBeenCalled();
      
      // Should not send push notification (disabled)
      expect(notificationService['sendPushNotification']).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock error in getUserPreferences
      jest.spyOn(notificationService as any, 'getUserPreferences').mockRejectedValue(new Error('Database error'));

      // Should not throw error
      await expect(notificationService.sendNotification(
        mockUserId,
        NotificationType.ORDER_CREATED,
        mockTitle,
        mockMessage,
        mockData
      )).resolves.toBeUndefined();
    });
  });

  describe('sendBulkNotification', () => {
    const mockUserIds = [1, 2, 3];
    const mockTitle = 'Bulk Notification';
    const mockMessage = 'This is a bulk notification';

    it('should send notifications to multiple users', async () => {
      // Mock sendNotification to succeed for all users
      jest.spyOn(notificationService, 'sendNotification').mockResolvedValue(undefined);

      const result = await notificationService.sendBulkNotification(
        mockUserIds,
        NotificationType.SYSTEM_MAINTENANCE,
        mockTitle,
        mockMessage
      );

      expect(result.success).toBe(3);
      expect(result.failed).toBe(0);
      expect(notificationService.sendNotification).toHaveBeenCalledTimes(3);
    });

    it('should handle partial failures', async () => {
      // Mock sendNotification to fail for second user
      jest.spyOn(notificationService, 'sendNotification')
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce(undefined);

      const result = await notificationService.sendBulkNotification(
        mockUserIds,
        NotificationType.SYSTEM_MAINTENANCE,
        mockTitle,
        mockMessage
      );

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });
  });

  describe('sendRoleNotification', () => {
    const mockRole = 'buyer';
    const mockTitle = 'Role Notification';
    const mockMessage = 'This is a role-based notification';

    it('should send notification to all users in role', async () => {
      // Mock Socket.IO sendToRole
      mockSocketService.sendToRole.mockReturnValue(undefined);
      
      // Mock sendPushToRole
      jest.spyOn(notificationService as any, 'sendPushToRole').mockResolvedValue(undefined);

      await notificationService.sendRoleNotification(
        mockRole,
        NotificationType.PROMOTIONAL,
        mockTitle,
        mockMessage
      );

      expect(mockSocketService.sendToRole).toHaveBeenCalledWith(
        mockRole,
        'notification',
        {
          type: NotificationType.PROMOTIONAL,
          title: mockTitle,
          message: mockMessage,
          data: undefined,
          timestamp: expect.any(String),
        }
      );

      expect(notificationService['sendPushToRole']).toHaveBeenCalledWith(
        mockRole,
        mockTitle,
        mockMessage,
        undefined
      );
    });

    it('should handle errors in role notification', async () => {
      // Mock Socket.IO to throw error
      mockSocketService.sendToRole.mockImplementation(() => {
        throw new Error('Socket error');
      });

      // Should not throw error
      await expect(notificationService.sendRoleNotification(
        mockRole,
        NotificationType.PROMOTIONAL,
        mockTitle,
        mockMessage
      )).resolves.toBeUndefined();
    });
  });

  describe('registerDeviceToken', () => {
    const mockUserId = 1;
    const mockToken = 'test-device-token';
    const mockPlatform = 'ios' as const;

    it('should register device token successfully', async () => {
      await expect(notificationService.registerDeviceToken(
        mockUserId,
        mockToken,
        mockPlatform
      )).resolves.toBeUndefined();
    });
  });

  describe('updateNotificationPreferences', () => {
    const mockUserId = 1;
    const mockPreferences = {
      pushNotifications: false,
      emailNotifications: true,
    };

    it('should update preferences successfully', async () => {
      await expect(notificationService.updateNotificationPreferences(
        mockUserId,
        mockPreferences
      )).resolves.toBeUndefined();
    });
  });

  describe('getUserNotifications', () => {
    const mockUserId = 1;

    it('should return empty array by default', async () => {
      const notifications = await notificationService.getUserNotifications(mockUserId);
      expect(notifications).toEqual([]);
    });

    it('should handle pagination parameters', async () => {
      const notifications = await notificationService.getUserNotifications(
        mockUserId,
        25,
        10
      );
      expect(notifications).toEqual([]);
    });
  });

  describe('markNotificationsAsRead', () => {
    const mockUserId = 1;
    const mockNotificationIds = [1, 2, 3];

    it('should mark notifications as read successfully', async () => {
      await expect(notificationService.markNotificationsAsRead(
        mockUserId,
        mockNotificationIds
      )).resolves.toBeUndefined();
    });
  });

  describe('Notification Type Email Mapping', () => {
    it('should map notification types to correct email templates', () => {
      const getEmailTemplateForNotificationType = (notificationService as any).getEmailTemplateForNotificationType.bind(notificationService);

      expect(getEmailTemplateForNotificationType(NotificationType.ORDER_CREATED)).toBe('order-confirmation');
      expect(getEmailTemplateForNotificationType(NotificationType.ORDER_UPDATED)).toBe('order-confirmation');
      expect(getEmailTemplateForNotificationType(NotificationType.ACCOUNT_VERIFIED)).toBe('email-verification');
      expect(getEmailTemplateForNotificationType(NotificationType.PROMOTIONAL)).toBe('general-notification');
    });
  });

  describe('shouldSendEmail', () => {
    const mockPreferences = {
      orderUpdates: true,
      paymentAlerts: false,
      listingNotifications: true,
      messageNotifications: false,
      priceAlerts: true,
      securityAlerts: true,
      promotionalOffers: false,
    };

    it('should return correct email sending decisions', () => {
      const shouldSendEmail = (notificationService as any).shouldSendEmail.bind(notificationService);

      expect(shouldSendEmail(NotificationType.ORDER_CREATED, mockPreferences)).toBe(true);
      expect(shouldSendEmail(NotificationType.PAYMENT_SUCCESS, mockPreferences)).toBe(false);
      expect(shouldSendEmail(NotificationType.LISTING_APPROVED, mockPreferences)).toBe(true);
      expect(shouldSendEmail(NotificationType.NEW_MESSAGE, mockPreferences)).toBe(false);
      expect(shouldSendEmail(NotificationType.PRICE_ALERT, mockPreferences)).toBe(true);
      expect(shouldSendEmail(NotificationType.SECURITY_ALERT, mockPreferences)).toBe(true);
      expect(shouldSendEmail(NotificationType.PROMOTIONAL, mockPreferences)).toBe(false);
    });
  });

  describe('Data Stringification', () => {
    it('should convert data object to string values', () => {
      const stringifyData = (notificationService as any).stringifyData.bind(notificationService);
      
      const mockData = {
        orderId: 123,
        message: 'test',
        metadata: { key: 'value' },
        isActive: true,
      };

      const result = stringifyData(mockData);

      expect(result).toEqual({
        orderId: '123',
        message: 'test',
        metadata: '{"key":"value"}',
        isActive: 'true',
      });
    });
  });
});