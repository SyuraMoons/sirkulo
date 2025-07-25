import { Router } from 'express';
import { PushNotificationController } from '../controllers/push-notification.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body } from 'express-validator';

const router = Router();
const pushNotificationController = new PushNotificationController();

/**
 * Device token registration validation
 */
const registerTokenValidation = [
  body('token')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Valid FCM token is required'),
  body('platform')
    .isIn(['android', 'ios', 'web'])
    .withMessage('Platform must be android, ios, or web'),
  body('deviceInfo')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Device info must be a string with max 100 characters'),
  body('appVersion')
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage('App version must be a string with max 50 characters'),
];

/**
 * Test notification validation
 */
const testNotificationValidation = [
  body('title')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be max 100 characters'),
  body('body')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Body is required and must be max 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
];

/**
 * Topic notification validation
 */
const topicNotificationValidation = [
  body('topic')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Topic is required and must be max 50 characters'),
  body('title')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be max 100 characters'),
  body('body')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Body is required and must be max 500 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
];

/**
 * Notification preferences validation
 */
const preferencesValidation = [
  body('topics')
    .isArray()
    .withMessage('Topics must be an array')
    .custom((topics) => {
      const availableTopics = [
        'general_notifications',
        'order_updates',
        'new_listings',
        'price_alerts',
        'chat_messages',
        'promotional_offers',
      ];
      
      for (const topic of topics) {
        if (!availableTopics.includes(topic)) {
          throw new Error(`Invalid topic: ${topic}`);
        }
      }
      return true;
    }),
];

/**
 * @route   POST /api/notifications/register-token
 * @desc    Register device token for push notifications
 * @access  Private
 */
router.post(
  '/register-token',
  authenticateToken,
  registerTokenValidation,
  validateRequest,
  pushNotificationController.registerToken.bind(pushNotificationController)
);

/**
 * @route   DELETE /api/notifications/unregister-token
 * @desc    Unregister device token
 * @access  Private
 */
router.delete(
  '/unregister-token',
  authenticateToken,
  [
    body('token')
      .isString()
      .isLength({ min: 10 })
      .withMessage('Valid FCM token is required'),
  ],
  validateRequest,
  pushNotificationController.unregisterToken.bind(pushNotificationController)
);

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification to user's devices
 * @access  Private
 */
router.post(
  '/test',
  authenticateToken,
  testNotificationValidation,
  validateRequest,
  pushNotificationController.sendTestNotification.bind(pushNotificationController)
);

/**
 * @route   GET /api/notifications/tokens
 * @desc    Get user's device tokens
 * @access  Private
 */
router.get(
  '/tokens',
  authenticateToken,
  pushNotificationController.getUserTokens.bind(pushNotificationController)
);

/**
 * @route   POST /api/notifications/topic
 * @desc    Send notification to topic (admin only)
 * @access  Private (Admin)
 */
router.post(
  '/topic',
  authenticateToken,
  topicNotificationValidation,
  validateRequest,
  pushNotificationController.sendTopicNotification.bind(pushNotificationController)
);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update notification preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticateToken,
  preferencesValidation,
  validateRequest,
  pushNotificationController.updatePreferences.bind(pushNotificationController)
);

export default router;
