/**
 * AI Chat Routes
 * Defines all routes for AI conversation functionality
 */

import { Router } from 'express';
import { AIChatController } from '../controllers/ai-chat.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import { body, param, query } from 'express-validator';

const router = Router();
const aiChatController = new AIChatController();

// Validation schemas
const createConversationValidation = [
  body('type')
    .optional()
    .isIn(['general', 'product_inquiry', 'order_support', 'recommendation', 'technical_support'])
    .withMessage('Invalid conversation type'),
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('context')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Context must not exceed 1000 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const sendMessageValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid conversation ID'),
  body('content')
    .notEmpty()
    .isLength({ min: 1, max: 4000 })
    .withMessage('Message content must be between 1 and 4000 characters'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

const conversationIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid conversation ID')
];

const getUserConversationsValidation = [
  query('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Invalid status'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
];

// Routes

/**
 * @route   POST /api/ai/conversations
 * @desc    Create a new AI conversation
 * @access  Private
 */
router.post(
  '/conversations',
  authenticateToken,
  createConversationValidation,
  validateRequest,
  aiChatController.createConversation
);

/**
 * @route   GET /api/ai/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get(
  '/conversations',
  authenticateToken,
  getUserConversationsValidation,
  validateRequest,
  aiChatController.getUserConversations
);

/**
 * @route   GET /api/ai/conversations/:id
 * @desc    Get specific conversation with messages
 * @access  Private
 */
router.get(
  '/conversations/:id',
  authenticateToken,
  conversationIdValidation,
  validateRequest,
  aiChatController.getConversation
);

/**
 * @route   POST /api/ai/conversations/:id/messages
 * @desc    Send message in conversation
 * @access  Private
 */
router.post(
  '/conversations/:id/messages',
  authenticateToken,
  sendMessageValidation,
  validateRequest,
  aiChatController.sendMessage
);

/**
 * @route   PUT /api/ai/conversations/:id/archive
 * @desc    Archive conversation
 * @access  Private
 */
router.put(
  '/conversations/:id/archive',
  authenticateToken,
  conversationIdValidation,
  validateRequest,
  aiChatController.archiveConversation
);

/**
 * @route   DELETE /api/ai/conversations/:id
 * @desc    Delete conversation
 * @access  Private
 */
router.delete(
  '/conversations/:id',
  authenticateToken,
  conversationIdValidation,
  validateRequest,
  aiChatController.deleteConversation
);

/**
 * @route   GET /api/ai/conversations/:id/stats
 * @desc    Get conversation statistics
 * @access  Private
 */
router.get(
  '/conversations/:id/stats',
  authenticateToken,
  conversationIdValidation,
  validateRequest,
  aiChatController.getConversationStats
);

/**
 * @route   GET /api/ai/conversation-types
 * @desc    Get available conversation types
 * @access  Public
 */
router.get(
  '/conversation-types',
  aiChatController.getConversationTypes
);

export { router as aiChatRoutes };