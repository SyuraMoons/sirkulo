import firebaseService from '../services/firebase.service';
import { AppDataSource } from '../config/database';
import { DeviceToken } from '../models/device-token.model';

/**
 * Firebase Integration Examples
 * 
 * This file demonstrates how to integrate Firebase push notifications
 * with existing Sirkulo backend services
 */

/**
 * Send welcome notification after user registration
 */
export async function sendWelcomeNotificationExample(userId: number, userName: string): Promise<void> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    // Get user's active device tokens
    const userTokens = await deviceTokenRepo.find({
      where: { userId, isActive: true },
    });

    if (userTokens.length > 0) {
      // Send welcome notification to the first active device
      const primaryToken = userTokens[0].token;
      
      await firebaseService.sendWelcomeNotification(primaryToken, userName);
      
      console.log(`📱 Welcome notification sent to user ${userId} (${userName})`);
    }
  } catch (error) {
    console.error('❌ Error sending welcome notification:', error);
  }
}

/**
 * Send order status update notification
 */
export async function sendOrderUpdateNotificationExample(
  userId: number,
  orderId: string,
  status: string
): Promise<void> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    // Get user's active device tokens
    const userTokens = await deviceTokenRepo.find({
      where: { userId, isActive: true },
    });

    if (userTokens.length > 0) {
      const statusMessages: Record<string, string> = {
        pending: 'Your order has been received and is being processed.',
        confirmed: 'Your order has been confirmed by the seller.',
        shipped: 'Your order has been shipped and is on the way!',
        delivered: 'Your order has been delivered successfully.',
        cancelled: 'Your order has been cancelled.',
      };

      const message = statusMessages[status] || `Your order status has been updated to ${status}.`;
      const primaryToken = userTokens[0].token;

      await firebaseService.sendOrderNotification(primaryToken, orderId, status, message);
      
      console.log(`📱 Order notification sent to user ${userId} for order ${orderId}: ${status}`);
    }
  } catch (error) {
    console.error('❌ Error sending order notification:', error);
  }
}

/**
 * Send new listing notification to interested users
 */
export async function sendNewListingNotificationExample(
  listingTitle: string,
  category: string,
  price: string,
  excludeUserId?: number
): Promise<void> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    // Get tokens for users interested in this category (excluding the listing creator)
    const query = deviceTokenRepo
      .createQueryBuilder('token')
      .innerJoin('token.user', 'user')
      .where('token.isActive = :isActive', { isActive: true });

    if (excludeUserId) {
      query.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const interestedTokens = await query.getMany();
    
    if (interestedTokens.length > 0) {
      const tokens = interestedTokens.map(dt => dt.token);
      
      await firebaseService.sendNewListingNotification(tokens, listingTitle, category, price);
      
      console.log(`📱 New listing notification sent to ${tokens.length} users`);
    }
  } catch (error) {
    console.error('❌ Error sending new listing notification:', error);
  }
}

/**
 * Send chat message notification
 */
export async function sendChatNotificationExample(
  recipientUserId: number,
  senderName: string,
  message: string,
  chatId: string
): Promise<void> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    // Get recipient's active device tokens
    const userTokens = await deviceTokenRepo.find({
      where: { userId: recipientUserId, isActive: true },
    });

    if (userTokens.length > 0) {
      const primaryToken = userTokens[0].token;
      
      await firebaseService.sendChatNotification(primaryToken, senderName, message, chatId);
      
      console.log(`📱 Chat notification sent to user ${recipientUserId} from ${senderName}`);
    }
  } catch (error) {
    console.error('❌ Error sending chat notification:', error);
  }
}

/**
 * Broadcast system announcement to all users
 */
export async function sendSystemAnnouncementExample(
  title: string,
  message: string
): Promise<void> {
  try {
    // Send to general notifications topic (all subscribed users)
    const result = await firebaseService.sendToTopic('general_notifications', {
      title,
      body: message,
      data: {
        type: 'system_announcement',
        priority: 'high',
      },
      action: 'view_announcement',
    });

    if (result.success) {
      console.log(`📱 System announcement broadcast successfully: ${title}`);
    } else {
      console.error(`❌ Failed to broadcast system announcement: ${result.error}`);
    }
  } catch (error) {
    console.error('❌ Error broadcasting system announcement:', error);
  }
}

/**
 * Clean up inactive device tokens
 */
export async function cleanupInactiveTokensExample(): Promise<void> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    // Find tokens that haven't been used in 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const inactiveTokens = await deviceTokenRepo.find({
      where: {
        isActive: true,
        lastUsed: undefined, // Never used
      },
      // OR lastUsed < thirtyDaysAgo (would need more complex query)
    });

    // Deactivate tokens that are no longer valid
    for (const token of inactiveTokens) {
      const validation = await firebaseService.validateToken(token.token);
      
      if (!validation.valid) {
        token.deactivate();
        await deviceTokenRepo.save(token);
        console.log(`🧹 Deactivated invalid token for user ${token.userId}`);
      }
    }
    
    console.log(`🧹 Token cleanup completed. Processed ${inactiveTokens.length} tokens.`);
  } catch (error) {
    console.error('❌ Error during token cleanup:', error);
  }
}

/**
 * Get notification statistics
 */
export async function getNotificationStatsExample(): Promise<{
  totalTokens: number;
  activeTokens: number;
  platformBreakdown: Record<string, number>;
}> {
  try {
    const deviceTokenRepo = AppDataSource.getRepository(DeviceToken);
    
    const totalTokens = await deviceTokenRepo.count();
    const activeTokens = await deviceTokenRepo.count({ where: { isActive: true } });
    
    // Get platform breakdown
    const platformStats = await deviceTokenRepo
      .createQueryBuilder('token')
      .select('token.platform, COUNT(*) as count')
      .where('token.isActive = :isActive', { isActive: true })
      .groupBy('token.platform')
      .getRawMany();
    
    const platformBreakdown: Record<string, number> = {};
    platformStats.forEach(stat => {
      platformBreakdown[stat.platform] = parseInt(stat.count);
    });
    
    const stats = {
      totalTokens,
      activeTokens,
      platformBreakdown,
    };
    
    console.log('📊 Notification Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting notification stats:', error);
    return {
      totalTokens: 0,
      activeTokens: 0,
      platformBreakdown: {},
    };
  }
}

// Export all example functions
export const FirebaseIntegrationExamples = {
  sendWelcomeNotificationExample,
  sendOrderUpdateNotificationExample,
  sendNewListingNotificationExample,
  sendChatNotificationExample,
  sendSystemAnnouncementExample,
  cleanupInactiveTokensExample,
  getNotificationStatsExample,
};
