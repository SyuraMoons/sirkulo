import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.middleware';
import NotificationService from '../services/notification.service';
import SocketService from '../config/socket';
import {
  SendNotificationDto,
  BulkNotificationDto,
  RoleNotificationDto,
  RegisterDeviceTokenDto,
  NotificationPreferencesDto,
  MarkNotificationsReadDto,
  GetNotificationsDto,
  NotificationType
} from '../types/notification.dto';

const router = Router();

/**
 * Get user's notifications
 * GET /api/notifications
 */
router.get('/',
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('unreadOnly').optional().isBoolean().toBoolean(),
    query('type').optional().isIn(Object.values(NotificationType)),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.id;
      const { limit = 50, offset = 0, unreadOnly = false, type } = req.query;

      const notifications = await NotificationService.getUserNotifications(
        userId,
        Number(limit),
        Number(offset)
      );

      res.json({
        status: 'success',
        data: {
          notifications,
          pagination: {
            limit: Number(limit),
            offset: Number(offset),
            total: notifications.length,
          },
        },
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notifications',
      });
    }
  }
);

/**
 * Send notification to user
 * POST /api/notifications/send
 */
router.post('/send',
  authenticateToken,
  [
    body('userId').isInt({ min: 1 }),
    body('type').isIn(Object.values(NotificationType)),
    body('title').isString().isLength({ min: 1, max: 100 }),
    body('message').isString().isLength({ min: 1, max: 500 }),
    body('data').optional().isObject(),
    body('priority').optional().isIn(['low', 'normal', 'high']),
    body('persistent').optional().isBoolean(),
    body('actionUrl').optional().isURL(),
    body('imageUrl').optional().isURL(),
    body('soundEnabled').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userId, type, title, message, data, ...options } = req.body;

      await NotificationService.sendNotification(
        userId,
        type,
        title,
        message,
        data,
        options
      );

      res.json({
        status: 'success',
        message: 'Notification sent successfully',
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send notification',
      });
    }
  }
);

/**
 * Send bulk notifications
 * POST /api/notifications/bulk
 */
router.post('/bulk',
  authenticateToken,
  [
    body('userIds').isArray({ min: 1 }),
    body('userIds.*').isInt({ min: 1 }),
    body('type').isIn(Object.values(NotificationType)),
    body('title').isString().isLength({ min: 1, max: 100 }),
    body('message').isString().isLength({ min: 1, max: 500 }),
    body('data').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { userIds, type, title, message, data } = req.body;

      const result = await NotificationService.sendBulkNotification(
        userIds,
        type,
        title,
        message,
        data
      );

      res.json({
        status: 'success',
        message: 'Bulk notification sent',
        data: result,
      });
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send bulk notification',
      });
    }
  }
);

/**
 * Send role-based notification
 * POST /api/notifications/role
 */
router.post('/role',
  authenticateToken,
  [
    body('role').isIn(['buyer', 'seller']),
    body('type').isIn(Object.values(NotificationType)),
    body('title').isString().isLength({ min: 1, max: 100 }),
    body('message').isString().isLength({ min: 1, max: 500 }),
    body('data').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { role, type, title, message, data } = req.body;

      await NotificationService.sendRoleNotification(
        role,
        type,
        title,
        message,
        data
      );

      res.json({
        status: 'success',
        message: `Role-based notification sent to all ${role}s`,
      });
    } catch (error) {
      console.error('Error sending role notification:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send role notification',
      });
    }
  }
);

/**
 * Mark notifications as read
 * PUT /api/notifications/read
 */
router.put('/read',
  authenticateToken,
  [
    body('notificationIds').isArray({ min: 1 }),
    body('notificationIds.*').isInt({ min: 1 }),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.id;
      const { notificationIds } = req.body;

      await NotificationService.markNotificationsAsRead(userId, notificationIds);

      res.json({
        status: 'success',
        message: 'Notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to mark notifications as read',
      });
    }
  }
);

/**
 * Register device token for push notifications
 * POST /api/notifications/device-token
 */
router.post('/device-token',
  authenticateToken,
  [
    body('token').isString().isLength({ min: 1 }),
    body('platform').isIn(['ios', 'android', 'web']),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.id;
      const { token, platform } = req.body;

      await NotificationService.registerDeviceToken(userId, token, platform);

      res.json({
        status: 'success',
        message: 'Device token registered successfully',
      });
    } catch (error) {
      console.error('Error registering device token:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to register device token',
      });
    }
  }
);

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      
      // In a real implementation, this would query the database
      const preferences = {
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

      res.json({
        status: 'success',
        data: preferences,
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notification preferences',
      });
    }
  }
);

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
router.put('/preferences',
  authenticateToken,
  [
    body('pushNotifications').optional().isBoolean(),
    body('emailNotifications').optional().isBoolean(),
    body('smsNotifications').optional().isBoolean(),
    body('inAppNotifications').optional().isBoolean(),
    body('orderUpdates').optional().isBoolean(),
    body('paymentAlerts').optional().isBoolean(),
    body('listingNotifications').optional().isBoolean(),
    body('messageNotifications').optional().isBoolean(),
    body('priceAlerts').optional().isBoolean(),
    body('securityAlerts').optional().isBoolean(),
    body('promotionalOffers').optional().isBoolean(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const userId = (req as any).user.id;
      const preferences = req.body;

      await NotificationService.updateNotificationPreferences(userId, preferences);

      res.json({
        status: 'success',
        message: 'Notification preferences updated successfully',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update notification preferences',
      });
    }
  }
);

/**
 * Get real-time connection stats
 * GET /api/notifications/stats
 */
router.get('/stats',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const socketService = SocketService;
      const connectedUserCount = socketService.getConnectedUserCount();
      const connectedUsers = socketService.getConnectedUsers();

      res.json({
        status: 'success',
        data: {
          connectedUserCount,
          connectedUsers: connectedUsers.length, // Don't expose user IDs for privacy
          serverUptime: process.uptime(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get notification stats',
      });
    }
  }
);

export default router;