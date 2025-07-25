import admin from 'firebase-admin';
import config from './index';

/**
 * Firebase Admin SDK Configuration
 * Handles Firebase initialization and messaging services
 */
class FirebaseService {
  private static instance: FirebaseService;
  private app: admin.app.App | null = null;

  private constructor() {
    this.initializeFirebase();
  }

  public static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initializeFirebase(): void {
    try {
      if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) {
        console.warn('⚠️ Firebase credentials not configured. Push notifications will be disabled.');
        return;
      }

      // Parse private key properly (handles escaped newlines)
      const privateKey = config.firebase.privateKey.replace(/\\n/g, '\n');

      const credential = admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: privateKey,
      });

      this.app = admin.initializeApp({
        credential: credential,
        projectId: config.firebase.projectId,
      });

      console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Get Firebase messaging instance
   */
  public getMessaging(): admin.messaging.Messaging | null {
    if (!this.app) {
      console.warn('⚠️ Firebase not initialized. Cannot send push notifications.');
      return null;
    }
    return admin.messaging();
  }

  /**
   * Send push notification to specific device token
   */
  public async sendToDevice(
    token: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    const messaging = this.getMessaging();
    if (!messaging) return false;

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.send(message);
      console.log('✅ Push notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ Failed to send push notification:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple device tokens
   */
  public async sendToMultipleDevices(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<{ success: number; failure: number }> {
    const messaging = this.getMessaging();
    if (!messaging || tokens.length === 0) {
      return { success: 0, failure: tokens.length };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.sendEachForMulticast(message);
      console.log(`✅ Push notifications sent: ${response.successCount} success, ${response.failureCount} failures`);
      
      return {
        success: response.successCount,
        failure: response.failureCount,
      };
    } catch (error) {
      console.error('❌ Failed to send push notifications:', error);
      return { success: 0, failure: tokens.length };
    }
  }

  /**
   * Send notification to topic subscribers
   */
  public async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    const messaging = this.getMessaging();
    if (!messaging) return false;

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: data || {},
        android: {
          priority: 'high',
          notification: {
            channelId: 'sirkulo_notifications',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await messaging.send(message);
      console.log('✅ Topic notification sent successfully:', response);
      return true;
    } catch (error) {
      console.error('❌ Failed to send topic notification:', error);
      return false;
    }
  }

  /**
   * Subscribe device token to topic
   */
  public async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    const messaging = this.getMessaging();
    if (!messaging) return false;

    try {
      await messaging.subscribeToTopic(tokens, topic);
      console.log(`✅ Subscribed ${tokens.length} devices to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  /**
   * Unsubscribe device token from topic
   */
  public async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    const messaging = this.getMessaging();
    if (!messaging) return false;

    try {
      await messaging.unsubscribeFromTopic(tokens, topic);
      console.log(`✅ Unsubscribed ${tokens.length} devices from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }
}

export default FirebaseService.getInstance();