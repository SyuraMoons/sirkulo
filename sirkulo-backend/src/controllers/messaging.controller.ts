import { Response } from 'express';
import { MessagingService } from '../services/messaging.service';
import {
  CreateConversationDto,
  SendMessageDto,
  EditMessageDto,
  ConversationSearchDto,
  MessageSearchDto,
  MarkMessagesReadDto,
  TypingIndicatorDto,
} from '../types/messaging.dto';
import { AuthenticatedRequest } from '../types/auth.dto';
import { ResponseUtil } from '../utils/response.util';

/**
 * Controller for managing messaging functionality
 */
export class MessagingController {
  private messagingService: MessagingService;

  constructor() {
    this.messagingService = new MessagingService();
  }

  /**
   * Create a new conversation or get existing one
   */
  createConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const createConversationDto: CreateConversationDto = req.body;

      const conversation = await this.messagingService.createOrGetConversation(userId, createConversationDto);

      ResponseUtil.success(res, {
        id: conversation.id,
        title: conversation.getDisplayTitle(userId),
        type: conversation.type,
        participants: [
          {
            id: conversation.participant1.id,
            name: conversation.participant1.fullName,
          },
          {
            id: conversation.participant2.id,
            name: conversation.participant2.fullName,
          }
        ],
        listing: conversation.listing ? {
          id: conversation.listing.id,
          title: conversation.listing.title,
        } : null,
        createdAt: conversation.createdAt,
      }, 'Conversation created successfully', 201);
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Send a message in a conversation
   */
  sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const sendMessageDto: SendMessageDto = req.body;

      const message = await this.messagingService.sendMessage(userId, sendMessageDto);

      ResponseUtil.success(res, message.toSummary(), 'Message sent successfully', 201);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Edit a message
   */
  editMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const messageId = parseInt(req.params.messageId);
      const editMessageDto: EditMessageDto = req.body;

      if (isNaN(messageId)) {
        ResponseUtil.error(res, 'Invalid message ID', 400);
        return;
      }

      const message = await this.messagingService.editMessage(userId, messageId, editMessageDto);

      ResponseUtil.success(res, message.toSummary(), 'Message updated successfully');
    } catch (error) {
      console.error('❌ Error editing message:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Delete a message
   */
  deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const messageId = parseInt(req.params.messageId);

      if (isNaN(messageId)) {
        ResponseUtil.error(res, 'Invalid message ID', 400);
        return;
      }

      await this.messagingService.deleteMessage(userId, messageId);

      ResponseUtil.success(res, null, 'Message deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting message:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Mark messages as read
   */
  markMessagesAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const markMessagesReadDto: MarkMessagesReadDto = req.body;

      await this.messagingService.markMessagesAsRead(userId, markMessagesReadDto);

      ResponseUtil.success(res, null, 'Messages marked as read');
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get user's conversations
   */
  getUserConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const searchDto: ConversationSearchDto = {
        search: req.query.search as string,
        type: req.query.type as any,
        listingId: req.query.listingId ? parseInt(req.query.listingId as string) : undefined,
        hasUnreadMessages: req.query.hasUnreadMessages === 'true',
        sortBy: req.query.sortBy as any || 'lastMessageAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await this.messagingService.getUserConversations(userId, searchDto);

      ResponseUtil.success(res, result.data, 'Conversations retrieved successfully', 200, result.meta);
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get conversation messages
   */
  getConversationMessages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const conversationId = parseInt(req.params.conversationId);

      if (isNaN(conversationId)) {
        ResponseUtil.error(res, 'Invalid conversation ID', 400);
        return;
      }

      const searchDto: MessageSearchDto = {
        search: req.query.search as string,
        messageType: req.query.messageType as any,
        unreadOnly: req.query.unreadOnly === 'true',
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'ASC',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        beforeMessageId: req.query.beforeMessageId ? parseInt(req.query.beforeMessageId as string) : undefined,
        afterMessageId: req.query.afterMessageId ? parseInt(req.query.afterMessageId as string) : undefined,
      };

      const result = await this.messagingService.getConversationMessages(userId, conversationId, searchDto);

      ResponseUtil.success(res, {
        conversation: result.conversation,
        messages: result.messages,
      }, 'Messages retrieved successfully', 200, result.meta);
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get conversation details
   */
  getConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const conversationId = parseInt(req.params.conversationId);

      if (isNaN(conversationId)) {
        ResponseUtil.error(res, 'Invalid conversation ID', 400);
        return;
      }

      const conversation = await this.messagingService.getConversationById(userId, conversationId);

      ResponseUtil.success(res, conversation.toSummary(userId), 'Conversation retrieved successfully');
    } catch (error) {
      console.error('❌ Error getting conversation:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Send typing indicator
   */
  sendTypingIndicator = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const typingIndicatorDto: TypingIndicatorDto = req.body;

      await this.messagingService.sendTypingIndicator(
        userId,
        typingIndicatorDto.conversationId,
        typingIndicatorDto.isTyping
      );

      ResponseUtil.success(res, null, 'Typing indicator sent');
    } catch (error) {
      console.error('❌ Error sending typing indicator:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Contact seller about a listing
   */
  contactSeller = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const listingId = parseInt(req.params.listingId);
      const { message } = req.body;

      if (isNaN(listingId)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      if (!message || typeof message !== 'string') {
        ResponseUtil.error(res, 'Message is required', 400);
        return;
      }

      // Get listing to find seller
      const listingRepository = (this.messagingService as any).listingRepository;
      const listing = await listingRepository.findOne({
        where: { id: listingId, isActive: true },
        relations: ['business']
      });

      if (!listing) {
        ResponseUtil.error(res, 'Listing not found or inactive', 404);
        return;
      }

      if (listing.businessId === userId) {
        ResponseUtil.error(res, 'Cannot contact yourself about your own listing', 400);
        return;
      }

      // Create conversation with seller
      const createConversationDto: CreateConversationDto = {
        participantId: listing.businessId,
        listingId: listingId,
        type: 'listing_inquiry',
        initialMessage: message,
      };

      const conversation = await this.messagingService.createOrGetConversation(userId, createConversationDto);

      ResponseUtil.success(res, {
        conversationId: conversation.id,
        sellerId: listing.businessId,
        listingTitle: listing.title,
        message: 'Message sent to seller successfully',
      }, 'Contact request sent successfully', 201);
    } catch (error) {
      console.error('❌ Error contacting seller:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get unread message count
   */
  getUnreadCount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Get total unread count across all conversations
      const messageReadStatusRepository = (this.messagingService as any).messageReadStatusRepository;
      const result = await messageReadStatusRepository
        .createQueryBuilder('readStatus')
        .select('SUM(readStatus.unreadCount)', 'totalUnread')
        .where('readStatus.userId = :userId', { userId })
        .getRawOne();

      const totalUnread = parseInt(result.totalUnread) || 0;

      ResponseUtil.success(res, {
        totalUnread,
        userId,
      }, 'Unread count retrieved successfully');
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };
}