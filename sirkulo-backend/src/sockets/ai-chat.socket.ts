/**
 * AI Chat Socket Handler
 * Handles real-time AI chat functionality via Socket.IO
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { AIConversationService, SendMessageOptions } from '../services/ai-conversation.service';
import { ConversationType } from '../entities/AIConversation';
import { MessageRole } from '../entities/AIMessage';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthenticatedSocket extends Socket {
  userId?: number;
  userEmail?: string;
}

export interface CreateConversationData {
  type?: ConversationType;
  title?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface JoinConversationData {
  conversationId: string;
}

export class AIChatSocketHandler {
  private aiConversationService: AIConversationService;

  constructor() {
    this.aiConversationService = new AIConversationService();
  }

  /**
   * Initialize AI chat socket handlers
   */
  public initialize(io: SocketIOServer): void {
    // AI Chat namespace
    const aiChatNamespace = io.of('/ai-chat');

    aiChatNamespace.use(this.authenticateSocket.bind(this));

    aiChatNamespace.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`🤖 AI Chat: User ${socket.userId} connected to AI chat`);

      // Join user to their personal room for direct messaging
      socket.join(`user:${socket.userId}`);

      // Handle conversation creation
      socket.on('ai:create-conversation', this.handleCreateConversation.bind(this, socket));

      // Handle joining a conversation
      socket.on('ai:join-conversation', this.handleJoinConversation.bind(this, socket));

      // Handle leaving a conversation
      socket.on('ai:leave-conversation', this.handleLeaveConversation.bind(this, socket));

      // Handle sending messages
      socket.on('ai:send-message', this.handleSendMessage.bind(this, socket));

      // Handle typing indicators
      socket.on('ai:typing-start', this.handleTypingStart.bind(this, socket));
      socket.on('ai:typing-stop', this.handleTypingStop.bind(this, socket));

      // Handle conversation management
      socket.on('ai:get-conversations', this.handleGetConversations.bind(this, socket));
      socket.on('ai:get-conversation', this.handleGetConversation.bind(this, socket));
      socket.on('ai:archive-conversation', this.handleArchiveConversation.bind(this, socket));

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🤖 AI Chat: User ${socket.userId} disconnected from AI chat`);
      });
    });
  }

  /**
   * Authenticate socket connection using JWT token
   */
  private async authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  }

  /**
   * Handle conversation creation
   */
  private async handleCreateConversation(
    socket: AuthenticatedSocket, 
    data: CreateConversationData,
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      const conversation = await this.aiConversationService.createConversation({
        userId: socket.userId,
        type: data.type,
        title: data.title,
        context: data.context,
        metadata: data.metadata
      });

      const response = {
        success: true,
        conversation: {
          id: conversation.id,
          type: conversation.type,
          title: conversation.title,
          status: conversation.status,
          createdAt: conversation.createdAt
        }
      };

      // Send response to client
      if (callback) callback(response);

      // Emit to user's room
      socket.to(`user:${socket.userId}`).emit('ai:conversation-created', response.conversation);

    } catch (error) {
      console.error('Error creating conversation:', error);
      const errorResponse = { success: false, error: 'Failed to create conversation' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle joining a conversation
   */
  private async handleJoinConversation(
    socket: AuthenticatedSocket,
    data: JoinConversationData,
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      const conversation = await this.aiConversationService.getConversation(data.conversationId);

      if (!conversation) {
        const error = { success: false, error: 'Conversation not found' };
        if (callback) callback(error);
        return;
      }

      if (conversation.userId !== socket.userId.toString()) {
        const error = { success: false, error: 'Access denied' };
        if (callback) callback(error);
        return;
      }

      // Join conversation room
      socket.join(`conversation:${data.conversationId}`);

      const response = {
        success: true,
        message: 'Joined conversation successfully'
      };

      if (callback) callback(response);

      // Notify others in the conversation (for future multi-user support)
      socket.to(`conversation:${data.conversationId}`).emit('ai:user-joined', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });

    } catch (error) {
      console.error('Error joining conversation:', error);
      const errorResponse = { success: false, error: 'Failed to join conversation' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle leaving a conversation
   */
  private async handleLeaveConversation(
    socket: AuthenticatedSocket,
    data: JoinConversationData,
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      // Leave conversation room
      socket.leave(`conversation:${data.conversationId}`);

      const response = { success: true, message: 'Left conversation successfully' };
      if (callback) callback(response);

      // Notify others in the conversation
      socket.to(`conversation:${data.conversationId}`).emit('ai:user-left', {
        userId: socket.userId,
        userEmail: socket.userEmail
      });

    } catch (error) {
      console.error('Error leaving conversation:', error);
      const errorResponse = { success: false, error: 'Failed to leave conversation' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle sending messages with real-time AI response
   */
  private async handleSendMessage(
    socket: AuthenticatedSocket,
    data: SendMessageData,
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      // Validate input
      if (!data.content || data.content.trim().length === 0) {
        const error = { success: false, error: 'Message content is required' };
        if (callback) callback(error);
        return;
      }

      // Verify conversation ownership
      const conversation = await this.aiConversationService.getConversation(data.conversationId);
      if (!conversation || conversation.userId !== socket.userId.toString()) {
        const error = { success: false, error: 'Conversation not found or access denied' };
        if (callback) callback(error);
        return;
      }

      // Emit user message immediately to conversation room
      const userMessagePreview = {
        id: 'temp-' + Date.now(),
        role: MessageRole.USER,
        content: data.content.trim(),
        status: 'sent',
        createdAt: new Date(),
        isTemporary: true
      };

      socket.to(`conversation:${data.conversationId}`).emit('ai:message-received', userMessagePreview);

      // Show AI typing indicator
      socket.to(`conversation:${data.conversationId}`).emit('ai:assistant-typing', {
        conversationId: data.conversationId,
        isTyping: true
      });

      // Send message and get AI response
      const options: SendMessageOptions = {
        conversationId: data.conversationId,
        content: data.content.trim(),
        role: MessageRole.USER,
        metadata: data.metadata
      };

      const result = await this.aiConversationService.sendMessage(options);

      // Hide AI typing indicator
      socket.to(`conversation:${data.conversationId}`).emit('ai:assistant-typing', {
        conversationId: data.conversationId,
        isTyping: false
      });

      if (!result.success) {
        const error = { success: false, error: result.error };
        if (callback) callback(error);
        return;
      }

      // Get the updated conversation with the new messages
      const updatedConversation = await this.aiConversationService.getConversation(data.conversationId);
      const recentMessages = updatedConversation?.messages?.slice(-2) || []; // Get last 2 messages (user + AI)

      const response = {
        success: true,
        messages: recentMessages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          status: msg.status,
          createdAt: msg.createdAt,
          metadata: msg.metadata
        })),
        metadata: result.metadata
      };

      // Send response to sender
      if (callback) callback(response);

      // Emit new messages to conversation room
      recentMessages.forEach(message => {
        socket.to(`conversation:${data.conversationId}`).emit('ai:message-received', {
          id: message.id,
          role: message.role,
          content: message.content,
          status: message.status,
          createdAt: message.createdAt
        });
      });

      // Update conversation in user's conversation list
      socket.to(`user:${socket.userId}`).emit('ai:conversation-updated', {
        conversationId: data.conversationId,
        lastMessage: recentMessages[recentMessages.length - 1],
        messageCount: updatedConversation?.messageCount || 0,
        updatedAt: updatedConversation?.updatedAt
      });

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator on error
      socket.to(`conversation:${data.conversationId}`).emit('ai:assistant-typing', {
        conversationId: data.conversationId,
        isTyping: false
      });

      const errorResponse = { success: false, error: 'Failed to send message' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle typing start indicator
   */
  private async handleTypingStart(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ): Promise<void> {
    socket.to(`conversation:${data.conversationId}`).emit('ai:user-typing', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      isTyping: true
    });
  }

  /**
   * Handle typing stop indicator
   */
  private async handleTypingStop(
    socket: AuthenticatedSocket,
    data: { conversationId: string }
  ): Promise<void> {
    socket.to(`conversation:${data.conversationId}`).emit('ai:user-typing', {
      userId: socket.userId,
      userEmail: socket.userEmail,
      isTyping: false
    });
  }

  /**
   * Handle getting user conversations
   */
  private async handleGetConversations(
    socket: AuthenticatedSocket,
    data: { status?: string; limit?: number; offset?: number },
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      const conversations = await this.aiConversationService.getUserConversations(
        socket.userId,
        data.status as any,
        data.limit,
        data.offset
      );

      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        type: conv.type,
        title: conv.title,
        status: conv.status,
        messageCount: conv.messageCount,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }));

      const response = {
        success: true,
        conversations: formattedConversations,
        total: conversations.length
      };

      if (callback) callback(response);

    } catch (error) {
      console.error('Error getting conversations:', error);
      const errorResponse = { success: false, error: 'Failed to get conversations' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle getting specific conversation
   */
  private async handleGetConversation(
    socket: AuthenticatedSocket,
    data: { conversationId: string },
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      const conversation = await this.aiConversationService.getConversation(data.conversationId);

      if (!conversation || conversation.userId !== socket.userId.toString()) {
        const error = { success: false, error: 'Conversation not found or access denied' };
        if (callback) callback(error);
        return;
      }

      const response = {
        success: true,
        conversation: {
          id: conversation.id,
          type: conversation.type,
          title: conversation.title,
          status: conversation.status,
          context: conversation.context,
          messageCount: conversation.messageCount,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
          messages: conversation.messages?.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            status: msg.status,
            createdAt: msg.createdAt
          })) || []
        }
      };

      if (callback) callback(response);

    } catch (error) {
      console.error('Error getting conversation:', error);
      const errorResponse = { success: false, error: 'Failed to get conversation' };
      if (callback) callback(errorResponse);
    }
  }

  /**
   * Handle archiving conversation
   */
  private async handleArchiveConversation(
    socket: AuthenticatedSocket,
    data: { conversationId: string },
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      if (!socket.userId) {
        const error = { success: false, error: 'User not authenticated' };
        if (callback) callback(error);
        return;
      }

      // Verify ownership
      const conversation = await this.aiConversationService.getConversation(data.conversationId);
      if (!conversation || conversation.userId !== socket.userId.toString()) {
        const error = { success: false, error: 'Conversation not found or access denied' };
        if (callback) callback(error);
        return;
      }

      const success = await this.aiConversationService.archiveConversation(data.conversationId);

      if (!success) {
        const error = { success: false, error: 'Failed to archive conversation' };
        if (callback) callback(error);
        return;
      }

      const response = { success: true, message: 'Conversation archived successfully' };
      if (callback) callback(response);

      // Notify user's other sessions
      socket.to(`user:${socket.userId}`).emit('ai:conversation-archived', {
        conversationId: data.conversationId
      });

    } catch (error) {
      console.error('Error archiving conversation:', error);
      const errorResponse = { success: false, error: 'Failed to archive conversation' };
      if (callback) callback(errorResponse);
    }
  }
}