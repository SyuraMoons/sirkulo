import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import { MessagingService } from '../services/messaging.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

interface JoinRoomData {
  conversationId: number;
}

interface LeaveRoomData {
  conversationId: number;
}

interface TypingData {
  conversationId: number;
  isTyping: boolean;
}

interface MessageData {
  conversationId: number;
  content?: string;
  type: 'text' | 'image' | 'file';
  attachments?: Array<{
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

/**
 * Socket.IO event handlers for real-time messaging
 */
export class MessagingSocketHandler {
  private messagingService: MessagingService;

  constructor() {
    this.messagingService = new MessagingService();
  }

  /**
   * Initialize messaging socket handlers
   */
  public initializeHandlers(io: SocketIOServer): void {
    io.use(this.authenticateSocket.bind(this));

    io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`👤 User ${socket.userId} connected to messaging`);

      // Join user to their personal room for notifications
      if (socket.userId) {
        socket.join(`user_${socket.userId}`);
      }

      // Handle joining conversation rooms
      socket.on('messaging:join_conversation', this.handleJoinConversation.bind(this, socket));

      // Handle leaving conversation rooms
      socket.on('messaging:leave_conversation', this.handleLeaveConversation.bind(this, socket));

      // Handle typing indicators
      socket.on('messaging:typing', this.handleTyping.bind(this, socket, io));

      // Handle real-time message sending
      socket.on('messaging:send_message', this.handleSendMessage.bind(this, socket, io));

      // Handle message read receipts
      socket.on('messaging:mark_read', this.handleMarkRead.bind(this, socket, io));

      // Handle user status updates
      socket.on('messaging:update_status', this.handleUpdateStatus.bind(this, socket, io));

      // Handle disconnection
      socket.on('disconnect', this.handleDisconnect.bind(this, socket, io));
    });
  }

  /**
   * Authenticate socket connection using JWT token
   */
  private async authenticateSocket(socket: AuthenticatedSocket, next: (err?: Error) => void): Promise<void> {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, config.jwtSecret) as { userId: number };
      socket.userId = decoded.userId;

      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Invalid authentication token'));
    }
  }

  /**
   * Handle joining a conversation room
   */
  private async handleJoinConversation(socket: AuthenticatedSocket, data: JoinRoomData): Promise<void> {
    try {
      const { conversationId } = data;

      if (!socket.userId) {
        socket.emit('messaging:error', { message: 'User not authenticated' });
        return;
      }

      // Verify user is participant in conversation
      const conversation = await this.messagingService.getConversation(conversationId, socket.userId);
      
      if (!conversation) {
        socket.emit('messaging:error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Join conversation room
      const roomName = `conversation_${conversationId}`;
      socket.join(roomName);

      // Notify other participants that user joined
      socket.to(roomName).emit('messaging:user_joined', {
        userId: socket.userId,
        conversationId,
        timestamp: new Date().toISOString(),
      });

      // Send confirmation to user
      socket.emit('messaging:joined_conversation', {
        conversationId,
        participants: conversation.participants,
      });

      console.log(`👥 User ${socket.userId} joined conversation ${conversationId}`);
    } catch (error) {
      console.error('Error joining conversation:', error);
      socket.emit('messaging:error', { message: 'Failed to join conversation' });
    }
  }

  /**
   * Handle leaving a conversation room
   */
  private handleLeaveConversation(socket: AuthenticatedSocket, data: LeaveRoomData): void {
    try {
      const { conversationId } = data;
      const roomName = `conversation_${conversationId}`;

      // Leave conversation room
      socket.leave(roomName);

      // Notify other participants that user left
      socket.to(roomName).emit('messaging:user_left', {
        userId: socket.userId,
        conversationId,
        timestamp: new Date().toISOString(),
      });

      // Send confirmation to user
      socket.emit('messaging:left_conversation', { conversationId });

      console.log(`👋 User ${socket.userId} left conversation ${conversationId}`);
    } catch (error) {
      console.error('Error leaving conversation:', error);
      socket.emit('messaging:error', { message: 'Failed to leave conversation' });
    }
  }

  /**
   * Handle typing indicators
   */
  private async handleTyping(socket: AuthenticatedSocket, io: SocketIOServer, data: TypingData): Promise<void> {
    try {
      const { conversationId, isTyping } = data;

      if (!socket.userId) {
        socket.emit('messaging:error', { message: 'User not authenticated' });
        return;
      }

      // Verify user is participant in conversation
      const conversation = await this.messagingService.getConversation(conversationId, socket.userId);
      
      if (!conversation) {
        socket.emit('messaging:error', { message: 'Conversation not found or access denied' });
        return;
      }

      // Broadcast typing indicator to other participants
      const roomName = `conversation_${conversationId}`;
      socket.to(roomName).emit('messaging:typing_indicator', {
        userId: socket.userId,
        conversationId,
        isTyping,
        timestamp: new Date().toISOString(),
      });

      // If user stopped typing, clear any existing timeout
      if (!isTyping) {
        socket.to(roomName).emit('messaging:typing_stopped', {
          userId: socket.userId,
          conversationId,
        });
      }

    } catch (error) {
      console.error('Error handling typing indicator:', error);
      socket.emit('messaging:error', { message: 'Failed to send typing indicator' });
    }
  }

  /**
   * Handle real-time message sending
   */
  private async handleSendMessage(socket: AuthenticatedSocket, io: SocketIOServer, data: MessageData): Promise<void> {
    try {
      const { conversationId, content, type, attachments } = data;

      if (!socket.userId) {
        socket.emit('messaging:error', { message: 'User not authenticated' });
        return;
      }

      // Send message through service
      const message = await this.messagingService.sendMessage({
        conversationId,
        senderId: socket.userId,
        content,
        type,
        attachments,
      });

      // Broadcast message to conversation participants
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit('messaging:new_message', {
        message,
        timestamp: new Date().toISOString(),
      });

      // Send push notifications to offline users
      const conversation = await this.messagingService.getConversation(conversationId, socket.userId);
      if (conversation) {
        const offlineParticipants = conversation.participants.filter(
          p => p.id !== socket.userId && !this.isUserOnline(io, p.id)
        );

        for (const participant of offlineParticipants) {
          // Emit to user's personal room for push notification handling
          io.to(`user_${participant.id}`).emit('messaging:push_notification', {
            type: 'new_message',
            conversationId,
            message: {
              id: message.id,
              content: message.content,
              senderName: message.sender.name,
              type: message.type,
            },
          });
        }
      }

      console.log(`💬 Message sent by user ${socket.userId} in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('messaging:error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle marking messages as read
   */
  private async handleMarkRead(socket: AuthenticatedSocket, io: SocketIOServer, data: { conversationId: number; messageIds?: number[] }): Promise<void> {
    try {
      const { conversationId, messageIds } = data;

      if (!socket.userId) {
        socket.emit('messaging:error', { message: 'User not authenticated' });
        return;
      }

      // Mark messages as read
      await this.messagingService.markMessagesAsRead({
        conversationId,
        userId: socket.userId,
        messageIds,
        markAllAsRead: !messageIds,
      });

      // Broadcast read receipt to other participants
      const roomName = `conversation_${conversationId}`;
      socket.to(roomName).emit('messaging:messages_read', {
        userId: socket.userId,
        conversationId,
        messageIds,
        timestamp: new Date().toISOString(),
      });

      // Update unread count for user
      const unreadCount = await this.messagingService.getUnreadCount(socket.userId);
      socket.emit('messaging:unread_count_updated', { count: unreadCount });

      console.log(`📖 User ${socket.userId} marked messages as read in conversation ${conversationId}`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('messaging:error', { message: 'Failed to mark messages as read' });
    }
  }

  /**
   * Handle user status updates
   */
  private handleUpdateStatus(socket: AuthenticatedSocket, io: SocketIOServer, data: { status: 'online' | 'away' | 'busy' }): void {
    try {
      const { status } = data;

      if (!socket.userId) {
        socket.emit('messaging:error', { message: 'User not authenticated' });
        return;
      }

      // Broadcast status update to all user's conversations
      // This would typically involve getting all user's conversations and notifying participants
      socket.broadcast.emit('messaging:user_status_updated', {
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString(),
      });

      console.log(`📊 User ${socket.userId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      socket.emit('messaging:error', { message: 'Failed to update status' });
    }
  }

  /**
   * Handle user disconnection
   */
  private handleDisconnect(socket: AuthenticatedSocket, io: SocketIOServer): void {
    try {
      if (socket.userId) {
        // Broadcast offline status to all conversations
        socket.broadcast.emit('messaging:user_offline', {
          userId: socket.userId,
          timestamp: new Date().toISOString(),
        });

        console.log(`👋 User ${socket.userId} disconnected from messaging`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  /**
   * Check if user is currently online
   */
  private isUserOnline(io: SocketIOServer, userId: number): boolean {
    const userRoom = `user_${userId}`;
    const sockets = io.sockets.adapter.rooms.get(userRoom);
    return sockets ? sockets.size > 0 : false;
  }

  /**
   * Get online users in a conversation
   */
  public getOnlineUsersInConversation(io: SocketIOServer, conversationId: number): number[] {
    const roomName = `conversation_${conversationId}`;
    const room = io.sockets.adapter.rooms.get(roomName);
    const onlineUsers: number[] = [];

    if (room) {
      room.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId) as AuthenticatedSocket;
        if (socket && socket.userId) {
          onlineUsers.push(socket.userId);
        }
      });
    }

    return onlineUsers;
  }

  /**
   * Send notification to specific user
   */
  public sendNotificationToUser(io: SocketIOServer, userId: number, notification: any): void {
    io.to(`user_${userId}`).emit('messaging:notification', notification);
  }

  /**
   * Broadcast message to conversation
   */
  public broadcastToConversation(io: SocketIOServer, conversationId: number, event: string, data: any): void {
    const roomName = `conversation_${conversationId}`;
    io.to(roomName).emit(event, data);
  }
}