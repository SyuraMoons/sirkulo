import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { DeviceToken } from '../models/device-token.model';
import { User } from '../models/user.model';
import firebaseService from '../services/firebase.service';
import { AuthenticatedRequest } from '../types';

/**
 * Push notification controller
 */
export class PushNotificationController {
  /**
   * Register device token for push notifications
   * POST /api/notifications/register-token
   */
  async registerToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token, platform, deviceInfo, appVersion } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!token || !platform) {
        res.status(400).json({
          success: false,
          message: 'Token and platform are required',
        });
        return;
      }

      // Validate platform
      if (!['android', 'ios', 'web'].includes(platform)) {
        res.status(400).json({
          success: false,
          message: 'Platform must be android, ios, or web',
        });
        return;
      }

      // Validate token with Firebase
      const validation = await firebaseService.validateToken(token);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          message: 'Invalid FCM token',
          error: validation.error,
        });
        return;
      }

      const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
      
      // Check if token already exists
      let deviceToken = await deviceTokenRepo.findOne({ 
        where: { token },
        relations: ['user']
      });

      if (deviceToken) {
        // Update existing token
        deviceToken.platform = platform;
        deviceToken.deviceInfo = deviceInfo;
        deviceToken.appVersion = appVersion;
        deviceToken.userId = userId;
        deviceToken.isActive = true;
        deviceToken.updateLastUsed();
      } else {
        // Create new device token
        deviceToken = deviceTokenRepo.create({
          token,
          platform,
          deviceInfo,
          appVersion,
          userId,
          isActive: true,
          lastUsed: new Date(),
        });
      }

      await deviceTokenRepo.save(deviceToken);

      // Subscribe to general notifications topic
      await firebaseService.subscribeToTopic(token, 'general_notifications');

      console.log(`📱 Device token registered for user ${userId}: ${platform}`);

      res.status(200).json({
        success: true,
        message: 'Device token registered successfully',
        data: {
          tokenId: deviceToken.id,
          platform: deviceToken.platform,
        },
      });
    } catch (error: any) {
      console.error('❌ Register token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to register device token',
        error: error.message,
      });
    }
  }

  /**
   * Unregister device token
   * DELETE /api/notifications/unregister-token
   */
  async unregisterToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!token) {
        res.status(400).json({
          success: false,
          message: 'Token is required',
        });
        return;
      }

      const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
      
      const deviceToken = await deviceTokenRepo.findOne({
        where: { token, userId },
      });

      if (!deviceToken) {
        res.status(404).json({
          success: false,
          message: 'Device token not found',
        });
        return;
      }

      // Unsubscribe from all topics
      await firebaseService.unsubscribeFromTopic(token, 'general_notifications');

      // Deactivate token instead of deleting for audit purposes
      deviceToken.deactivate();
      await deviceTokenRepo.save(deviceToken);

      console.log(`📱 Device token unregistered for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Device token unregistered successfully',
      });
    } catch (error: any) {
      console.error('❌ Unregister token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to unregister device token',
        error: error.message,
      });
    }
  }

  /**
   * Send test notification
   * POST /api/notifications/test
   */
  async sendTestNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, body, data } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!title || !body) {
        res.status(400).json({
          success: false,
          message: 'Title and body are required',
        });
        return;
      }

      const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
      
      // Get all active tokens for the user
      const userTokens = await deviceTokenRepo.find({
        where: { userId, isActive: true },
      });

      if (userTokens.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No active device tokens found for user',
        });
        return;
      }

      const tokens = userTokens.map(dt => dt.token);
      
      // Send notification to all user devices
      const result = await firebaseService.sendToMultipleDevices(tokens, {
        title,
        body,
        data: {
          type: 'test',
          ...data,
        },
        action: 'test',
        userId: userId.toString(),
      });

      console.log(`📱 Test notification sent to ${tokens.length} devices for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully',
        data: {
          devicesNotified: tokens.length,
          successCount: result.successCount,
          failureCount: result.failureCount,
        },
      });
    } catch (error: any) {
      console.error('❌ Send test notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message,
      });
    }
  }

  /**
   * Get user's device tokens
   * GET /api/notifications/tokens
   */
  async getUserTokens(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
      
      const tokens = await deviceTokenRepo.find({
        where: { userId },
        select: ['id', 'platform', 'deviceInfo', 'appVersion', 'isActive', 'lastUsed', 'createdAt'],
        order: { lastUsed: 'DESC' },
      });

      res.status(200).json({
        success: true,
        message: 'Device tokens retrieved successfully',
        data: {
          tokens,
          totalCount: tokens.length,
          activeCount: tokens.filter(t => t.isActive).length,
        },
      });
    } catch (error: any) {
      console.error('❌ Get user tokens error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve device tokens',
        error: error.message,
      });
    }
  }

  /**
   * Send notification to topic (admin only)
   * POST /api/notifications/topic
   */
  async sendTopicNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { topic, title, body, data } = req.body;
      const user = req.user;

      // Check if user is admin
      if (!user?.hasRole('admin')) {
        res.status(403).json({
          success: false,
          message: 'Admin access required',
        });
        return;
      }

      if (!topic || !title || !body) {
        res.status(400).json({
          success: false,
          message: 'Topic, title, and body are required',
        });
        return;
      }

      const result = await firebaseService.sendToTopic(topic, {
        title,
        body,
        data: {
          type: 'topic_broadcast',
          topic,
          ...data,
        },
        action: 'topic_notification',
      });

      console.log(`📱 Topic notification sent to "${topic}" by admin ${user.id}`);

      res.status(200).json({
        success: true,
        message: 'Topic notification sent successfully',
        data: {
          topic,
          messageId: result.messageId,
        },
      });
    } catch (error: any) {
      console.error('❌ Send topic notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send topic notification',
        error: error.message,
      });
    }
  }

  /**
   * Update notification preferences
   * PUT /api/notifications/preferences
   */
  async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { topics } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!Array.isArray(topics)) {
        res.status(400).json({
          success: false,
          message: 'Topics must be an array',
        });
        return;
      }

      const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
      
      // Get all active tokens for the user
      const userTokens = await deviceTokenRepo.find({
        where: { userId, isActive: true },
      });

      if (userTokens.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No active device tokens found',
        });
        return;
      }

      const tokens = userTokens.map(dt => dt.token);

      // Available topics
      const availableTopics = [
        'general_notifications',
        'order_updates',
        'new_listings',
        'price_alerts',
        'chat_messages',
        'promotional_offers',
      ];

      // Subscribe to selected topics
      for (const topic of topics) {
        if (availableTopics.includes(topic)) {
          await firebaseService.subscribeToTopic(tokens, topic);
        }
      }

      // Unsubscribe from unselected topics
      const unselectedTopics = availableTopics.filter(topic => !topics.includes(topic));
      for (const topic of unselectedTopics) {
        await firebaseService.unsubscribeFromTopic(tokens, topic);
      }

      console.log(`📱 Notification preferences updated for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Notification preferences updated successfully',
        data: {
          subscribedTopics: topics,
          devicesUpdated: tokens.length,
        },
      });
    } catch (error: any) {
      console.error('❌ Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
        error: error.message,
      });
    }
  }
}
