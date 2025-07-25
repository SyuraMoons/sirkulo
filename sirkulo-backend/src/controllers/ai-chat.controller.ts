/**
 * AI Chat Controller
 * Handles HTTP endpoints for AI conversation functionality
 */

import { Request, Response } from 'express';
import { AIConversationService, CreateConversationOptions, SendMessageOptions } from '../services/ai-conversation.service';
import { ConversationType, ConversationStatus } from '../entities/AIConversation';
import { MessageRole } from '../entities/AIMessage';
import { ResponseUtil } from '../utils/response.util';
import { AuthenticatedRequest } from '../types/auth.dto';

export class AIChatController {
  private aiConversationService: AIConversationService;

  constructor() {
    this.aiConversationService = new AIConversationService();
  }

  /**
   * Create a new AI conversation
   * POST /api/ai/conversations
   */
  createConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { type, title, context, metadata } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const options: CreateConversationOptions = {
        userId: userId,
        type: type || ConversationType.GENERAL,
        title,
        context,
        metadata
      };

      const conversation = await this.aiConversationService.createConversation(options);

      ResponseUtil.success(res, {
        conversation: {
          id: conversation.id,
          type: conversation.type,
          title: conversation.title,
          status: conversation.status,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt
        }
      }, 'Conversation created successfully', 201);

    } catch (error) {
      console.error('Error creating conversation:', error);
      ResponseUtil.error(res, 'Failed to create conversation', 500);
    }
  };

  /**
   * Get user's conversations
   * GET /api/ai/conversations
   */
  getUserConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const {
        status = ConversationStatus.ACTIVE,
        limit = 50,
        offset = 0
      } = req.query;

      const conversations = await this.aiConversationService.getUserConversations(
        userId,
        status as ConversationStatus,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        type: conv.type,
        title: conv.title,
        status: conv.status,
        messageCount: conv.messageCount,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        recentMessages: conv.messages?.slice(-3).map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          createdAt: msg.createdAt
        })) || []
      }));

      ResponseUtil.success(res, {
        conversations: formattedConversations,
        total: conversations.length
      });

    } catch (error) {
      console.error('Error getting conversations:', error);
      ResponseUtil.error(res, 'Failed to get conversations', 500);
    }
  };

  /**
   * Get specific conversation with messages
   * GET /api/ai/conversations/:id
   */
  getConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const conversation = await this.aiConversationService.getConversation(id);

      if (!conversation) {
        ResponseUtil.error(res, 'Conversation not found', 404);
        return;
      }

      // Check if user owns the conversation
      if (conversation.userId !== userId.toString()) {
        ResponseUtil.error(res, 'Access denied', 403);
        return;
      }

      const formattedConversation = {
        id: conversation.id,
        type: conversation.type,
        title: conversation.title,
        status: conversation.status,
        context: conversation.context,
        metadata: conversation.metadata,
        messageCount: conversation.messageCount,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        messages: conversation.messages?.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          status: msg.status,
          tokenCount: msg.tokenCount,
          modelUsed: msg.modelUsed,
          responseTime: msg.responseTime,
          confidenceScore: msg.confidenceScore,
          createdAt: msg.createdAt,
          metadata: msg.metadata
        })) || []
      };

      ResponseUtil.success(res, { conversation: formattedConversation });

    } catch (error) {
      console.error('Error getting conversation:', error);
      ResponseUtil.error(res, 'Failed to get conversation', 500);
    }
  };

  /**
   * Send message in conversation
   * POST /api/ai/conversations/:id/messages
   */
  sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content, metadata } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      if (!content || content.trim().length === 0) {
        ResponseUtil.error(res, 'Message content is required', 400);
        return;
      }

      // Verify user owns the conversation
      const conversation = await this.aiConversationService.getConversation(id);
      if (!conversation) {
        ResponseUtil.error(res, 'Conversation not found', 404);
        return;
      }

      if (conversation.userId !== userId.toString()) {
        ResponseUtil.error(res, 'Access denied', 403);
        return;
      }

      const options: SendMessageOptions = {
        conversationId: id,
        content: content.trim(),
        role: MessageRole.USER,
        metadata
      };

      const result = await this.aiConversationService.sendMessage(options);

      if (!result.success) {
        ResponseUtil.error(res, result.error || 'Failed to send message', 500);
        return;
      }

      ResponseUtil.success(res, {
        message: {
          id: result.message?.id,
          role: result.message?.role,
          content: result.message?.content,
          status: result.message?.status,
          createdAt: result.message?.createdAt
        },
        metadata: result.metadata
      }, 'Message sent successfully');

    } catch (error) {
      console.error('Error sending message:', error);
      ResponseUtil.error(res, 'Failed to send message', 500);
    }
  };

  /**
   * Archive conversation
   * PUT /api/ai/conversations/:id/archive
   */
  archiveConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      // Verify user owns the conversation
      const conversation = await this.aiConversationService.getConversation(id);
      if (!conversation) {
        ResponseUtil.error(res, 'Conversation not found', 404);
        return;
      }

      if (conversation.userId !== userId.toString()) {
        ResponseUtil.error(res, 'Access denied', 403);
        return;
      }

      const success = await this.aiConversationService.archiveConversation(id);

      if (!success) {
        ResponseUtil.error(res, 'Failed to archive conversation', 500);
        return;
      }

      ResponseUtil.success(res, {}, 'Conversation archived successfully');

    } catch (error) {
      console.error('Error archiving conversation:', error);
      ResponseUtil.error(res, 'Failed to archive conversation', 500);
    }
  };

  /**
   * Delete conversation
   * DELETE /api/ai/conversations/:id
   */
  deleteConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      // Verify user owns the conversation
      const conversation = await this.aiConversationService.getConversation(id);
      if (!conversation) {
        ResponseUtil.error(res, 'Conversation not found', 404);
        return;
      }

      if (conversation.userId !== userId.toString()) {
        ResponseUtil.error(res, 'Access denied', 403);
        return;
      }

      const success = await this.aiConversationService.deleteConversation(id);

      if (!success) {
        ResponseUtil.error(res, 'Failed to delete conversation', 500);
        return;
      }

      ResponseUtil.success(res, {}, 'Conversation deleted successfully');

    } catch (error) {
      console.error('Error deleting conversation:', error);
      ResponseUtil.error(res, 'Failed to delete conversation', 500);
    }
  };

  /**
   * Get conversation statistics
   * GET /api/ai/conversations/:id/stats
   */
  getConversationStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      // Verify user owns the conversation
      const conversation = await this.aiConversationService.getConversation(id);
      if (!conversation) {
        ResponseUtil.error(res, 'Conversation not found', 404);
        return;
      }

      if (conversation.userId !== userId.toString()) {
        ResponseUtil.error(res, 'Access denied', 403);
        return;
      }

      const stats = await this.aiConversationService.getConversationStats(id);

      if (!stats) {
        ResponseUtil.error(res, 'Failed to get conversation statistics', 500);
        return;
      }

      ResponseUtil.success(res, { stats });

    } catch (error) {
      console.error('Error getting conversation stats:', error);
      ResponseUtil.error(res, 'Failed to get conversation statistics', 500);
    }
  };

  /**
   * Get available conversation types
   * GET /api/ai/conversation-types
   */
  getConversationTypes = async (_req: Request, res: Response): Promise<void> => {
    try {
      const types = Object.values(ConversationType).map(type => ({
        value: type,
        label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }));

      ResponseUtil.success(res, { types });

    } catch (error) {
      console.error('Error getting conversation types:', error);
      ResponseUtil.error(res, 'Failed to get conversation types', 500);
    }
  };
}