import express from 'express';
import { MessagingController } from '../controllers/messaging.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();
const messagingController = new MessagingController();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Create conversation validation
const createConversationValidation = [
  body('participantId')
    .isInt({ min: 1 })
    .withMessage('Participant ID must be a positive integer'),
  body('type')
    .isIn(['general', 'listing_inquiry', 'support'])
    .withMessage('Type must be general, listing_inquiry, or support'),
  body('listingId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Listing ID must be a positive integer'),
  body('initialMessage')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Initial message must be between 1 and 5000 characters'),
];

// Send message validation
const sendMessageValidation = [
  body('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('content')
    .optional()
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('type')
    .isIn(['text', 'image', 'file'])
    .withMessage('Type must be text, image, or file'),
  body('attachments')
    .optional()
    .isArray()
    .withMessage('Attachments must be an array'),
  body('attachments.*.url')
    .optional()
    .isURL()
    .withMessage('Attachment URL must be valid'),
  body('attachments.*.filename')
    .optional()
    .isString()
    .isLength({ min: 1, max: 255 })
    .withMessage('Attachment filename must be between 1 and 255 characters'),
  body('attachments.*.mimeType')
    .optional()
    .isString()
    .withMessage('Attachment mime type is required'),
  body('attachments.*.size')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attachment size must be a positive integer'),
];

// Edit message validation
const editMessageValidation = [
  param('messageId')
    .isInt({ min: 1 })
    .withMessage('Message ID must be a positive integer'),
  body('content')
    .isString()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
];

// Mark messages as read validation
const markMessagesReadValidation = [
  body('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('messageIds')
    .optional()
    .isArray()
    .withMessage('Message IDs must be an array'),
  body('messageIds.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each message ID must be a positive integer'),
  body('markAllAsRead')
    .optional()
    .isBoolean()
    .withMessage('Mark all as read must be a boolean'),
];

// Conversation search validation
const conversationSearchValidation = [
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters'),
  query('type')
    .optional()
    .isIn(['general', 'listing_inquiry', 'support'])
    .withMessage('Type must be general, listing_inquiry, or support'),
  query('listingId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Listing ID must be a positive integer'),
  query('hasUnreadMessages')
    .optional()
    .isBoolean()
    .withMessage('Has unread messages must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['lastMessageAt', 'createdAt'])
    .withMessage('Sort by must be lastMessageAt or createdAt'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Message search validation
const messageSearchValidation = [
  param('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  query('search')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Search query must be at most 100 characters'),
  query('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file'),
  query('unreadOnly')
    .optional()
    .isBoolean()
    .withMessage('Unread only must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt'])
    .withMessage('Sort by must be createdAt or updatedAt'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('beforeMessageId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Before message ID must be a positive integer'),
  query('afterMessageId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('After message ID must be a positive integer'),
];

// Typing indicator validation
const typingIndicatorValidation = [
  body('conversationId')
    .isInt({ min: 1 })
    .withMessage('Conversation ID must be a positive integer'),
  body('isTyping')
    .isBoolean()
    .withMessage('Is typing must be a boolean'),
];

// Contact seller validation
const contactSellerValidation = [
  param('listingId')
    .isInt({ min: 1 })
    .withMessage('Listing ID must be a positive integer'),
  body('message')
    .isString()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateConversationRequest:
 *       type: object
 *       required:
 *         - participantId
 *         - type
 *       properties:
 *         participantId:
 *           type: integer
 *           description: ID of the other participant
 *         type:
 *           type: string
 *           enum: [general, listing_inquiry, support]
 *           description: Type of conversation
 *         listingId:
 *           type: integer
 *           description: ID of related listing (for listing_inquiry type)
 *         initialMessage:
 *           type: string
 *           maxLength: 5000
 *           description: Initial message to send
 *     
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - conversationId
 *         - type
 *       properties:
 *         conversationId:
 *           type: integer
 *           description: ID of the conversation
 *         content:
 *           type: string
 *           maxLength: 5000
 *           description: Message content
 *         type:
 *           type: string
 *           enum: [text, image, file]
 *           description: Type of message
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               filename:
 *                 type: string
 *               mimeType:
 *                 type: string
 *               size:
 *                 type: integer
 */

/**
 * @swagger
 * /api/messaging/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/conversations',
  authenticateToken,
  createConversationValidation,
  handleValidationErrors,
  messagingController.createConversation
);

/**
 * @swagger
 * /api/messaging/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in conversation titles or participant names
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [general, listing_inquiry, support]
 *         description: Filter by conversation type
 *       - in: query
 *         name: listingId
 *         schema:
 *           type: integer
 *         description: Filter by listing ID
 *       - in: query
 *         name: hasUnreadMessages
 *         schema:
 *           type: boolean
 *         description: Filter conversations with unread messages
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [lastMessageAt, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations',
  authenticateToken,
  conversationSearchValidation,
  handleValidationErrors,
  messagingController.getUserConversations
);

/**
 * @swagger
 * /api/messaging/conversations/{conversationId}:
 *   get:
 *     summary: Get conversation details
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations/:conversationId',
  authenticateToken,
  param('conversationId').isInt({ min: 1 }),
  handleValidationErrors,
  messagingController.getConversation
);

/**
 * @swagger
 * /api/messaging/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get conversation messages
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Conversation ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in message content
 *       - in: query
 *         name: messageType
 *         schema:
 *           type: string
 *           enum: [text, image, file]
 *         description: Filter by message type
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Show only unread messages
 *       - in: query
 *         name: beforeMessageId
 *         schema:
 *           type: integer
 *         description: Get messages before this message ID
 *       - in: query
 *         name: afterMessageId
 *         schema:
 *           type: integer
 *         description: Get messages after this message ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       404:
 *         description: Conversation not found
 *       401:
 *         description: Unauthorized
 */
router.get('/conversations/:conversationId/messages',
  authenticateToken,
  messageSearchValidation,
  handleValidationErrors,
  messagingController.getConversationMessages
);

/**
 * @swagger
 * /api/messaging/messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/messages',
  authenticateToken,
  sendMessageValidation,
  handleValidationErrors,
  messagingController.sendMessage
);

/**
 * @swagger
 * /api/messaging/messages/{messageId}:
 *   patch:
 *     summary: Edit a message
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 *       401:
 *         description: Unauthorized
 */
router.patch('/messages/:messageId',
  authenticateToken,
  editMessageValidation,
  handleValidationErrors,
  messagingController.editMessage
);

/**
 * @swagger
 * /api/messaging/messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/messages/:messageId',
  authenticateToken,
  param('messageId').isInt({ min: 1 }),
  handleValidationErrors,
  messagingController.deleteMessage
);

/**
 * @swagger
 * /api/messaging/messages/read:
 *   post:
 *     summary: Mark messages as read
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: integer
 *               messageIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               markAllAsRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Messages marked as read
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/messages/read',
  authenticateToken,
  markMessagesReadValidation,
  handleValidationErrors,
  messagingController.markMessagesAsRead
);

/**
 * @swagger
 * /api/messaging/typing:
 *   post:
 *     summary: Send typing indicator
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               conversationId:
 *                 type: integer
 *               isTyping:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Typing indicator sent
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/typing',
  authenticateToken,
  typingIndicatorValidation,
  handleValidationErrors,
  messagingController.sendTypingIndicator
);

/**
 * @swagger
 * /api/messaging/listings/{listingId}/contact:
 *   post:
 *     summary: Contact seller about a listing
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Contact request sent successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Listing not found
 *       401:
 *         description: Unauthorized
 */
router.post('/listings/:listingId/contact',
  authenticateToken,
  contactSellerValidation,
  handleValidationErrors,
  messagingController.contactSeller
);

/**
 * @swagger
 * /api/messaging/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messaging]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/unread-count',
  authenticateToken,
  messagingController.getUnreadCount
);

export default router;