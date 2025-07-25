import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';
import { MessageReadStatus } from '../models/message-read-status.model';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import SocketService from '../config/socket';
import { FirebaseService } from './firebase.service';
import {
  CreateConversationDto,
  SendMessageDto,
  EditMessageDto,
  ConversationSearchDto,
  MessageSearchDto,
  MarkMessagesReadDto,
  ConversationResponseDto,
  MessageResponseDto,
  PaginatedConversationsResponseDto,
  PaginatedMessagesResponseDto,
  ConversationWithMessagesDto,
  MessageEventDto,
  TypingEventDto,
  ConversationUpdateEventDto,
} from '../types/messaging.dto';

/**
 * Service for managing real-time messaging
 */
export class MessagingService {
  private conversationRepository: Repository<Conversation>;
  private messageRepository: Repository<Message>;
  private messageReadStatusRepository: Repository<MessageReadStatus>;
  private userRepository: Repository<User>;
  private listingRepository: Repository<Listing>;
  private socketService: typeof SocketService;
  private firebaseService: FirebaseService;

  constructor() {
    this.conversationRepository = AppDataSource.getRepository(Conversation);
    this.messageRepository = AppDataSource.getRepository(Message);
    this.messageReadStatusRepository = AppDataSource.getRepository(MessageReadStatus);
    this.userRepository = AppDataSource.getRepository(User);
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.socketService = SocketService;
    this.firebaseService = new FirebaseService();
  }

  /**
   * Create a new conversation or get existing one
   */
  async createOrGetConversation(userId: number, createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { participantId, listingId, title, type = 'direct', initialMessage } = createConversationDto;

    // Validate participants are different
    if (userId === participantId) {
      throw new Error('Cannot create conversation with yourself');
    }

    // Check if participants exist
    const [participant1, participant2] = await Promise.all([
      this.userRepository.findOne({ where: { id: userId } }),
      this.userRepository.findOne({ where: { id: participantId } })
    ]);

    if (!participant1 || !participant2) {
      throw new Error('One or both participants not found');
    }

    // For listing inquiries, check if listing exists
    let listing = null;
    if (listingId) {
      listing = await this.listingRepository.findOne({
        where: { id: listingId, isActive: true }
      });
      if (!listing) {
        throw new Error('Listing not found or inactive');
      }
    }

    // Check if conversation already exists
    let existingConversation = null;
    if (type === 'listing_inquiry' && listingId) {
      existingConversation = await this.conversationRepository.findOne({
        where: [
          { participant1Id: userId, participant2Id: participantId, listingId, type },
          { participant1Id: participantId, participant2Id: userId, listingId, type }
        ],
        relations: ['participant1', 'participant2', 'listing']
      });
    } else {
      existingConversation = await this.conversationRepository.findOne({
        where: [
          { participant1Id: userId, participant2Id: participantId, type: 'direct' },
          { participant1Id: participantId, participant2Id: userId, type: 'direct' }
        ],
        relations: ['participant1', 'participant2']
      });
    }

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversation = this.conversationRepository.create({
      participant1Id: userId,
      participant2Id: participantId,
      listingId,
      title,
      type,
      isActive: true,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // Create read status entries for both participants
    await Promise.all([
      this.createMessageReadStatus(userId, savedConversation.id),
      this.createMessageReadStatus(participantId, savedConversation.id)
    ]);

    // Send initial message if provided
    if (initialMessage) {
      await this.sendMessage(userId, {
        conversationId: savedConversation.id,
        content: initialMessage,
        messageType: 'text'
      });
    }

    // Load conversation with relations
    return this.conversationRepository.findOne({
      where: { id: savedConversation.id },
      relations: ['participant1', 'participant2', 'listing']
    }) as Promise<Conversation>;
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(userId: number, sendMessageDto: SendMessageDto): Promise<Message> {
    const { conversationId, content, messageType = 'text', attachments } = sendMessageDto;

    // Get conversation and verify user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2', 'listing']
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!conversation.isParticipant(userId)) {
      throw new Error('You are not a participant in this conversation');
    }

    const recipientId = conversation.getOtherParticipantId(userId);

    // Create message
    const message = this.messageRepository.create({
      conversationId,
      senderId: userId,
      recipientId,
      content,
      messageType,
      attachments: attachments || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation metadata
    conversation.updateLastMessage(savedMessage.getPreviewText());
    await this.conversationRepository.save(conversation);

    // Update read status - increment unread count for recipient
    await this.updateUnreadCount(recipientId, conversationId);

    // Load message with relations for response
    const messageWithRelations = await this.messageRepository.findOne({
      where: { id: savedMessage.id },
      relations: ['sender', 'recipient']
    });

    if (!messageWithRelations) {
      throw new Error('Failed to load message with relations');
    }

    // Send real-time notifications
    await this.sendRealTimeNotifications(messageWithRelations, conversation);

    return messageWithRelations;
  }

  /**
   * Edit a message
   */
  async editMessage(userId: number, messageId: number, editMessageDto: EditMessageDto): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.canBeEditedBy(userId)) {
      throw new Error('You cannot edit this message');
    }

    message.content = editMessageDto.content;
    message.markAsEdited();

    const updatedMessage = await this.messageRepository.save(message);

    // Send real-time update
    this.socketService.sendToRoom(`chat:${message.conversationId}`, 'message:edited', {
      messageId: message.id,
      content: message.content,
      editedAt: message.editedAt,
    });

    return updatedMessage;
  }

  /**
   * Delete a message
   */
  async deleteMessage(userId: number, messageId: number): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender']
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (!message.canBeDeletedBy(userId)) {
      throw new Error('You cannot delete this message');
    }

    message.markAsDeleted();
    await this.messageRepository.save(message);

    // Send real-time update
    this.socketService.sendToRoom(`chat:${message.conversationId}`, 'message:deleted', {
      messageId: message.id,
    });
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(userId: number, markMessagesReadDto: MarkMessagesReadDto): Promise<void> {
    const { conversationId, lastMessageId } = markMessagesReadDto;

    // Verify user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation || !conversation.isParticipant(userId)) {
      throw new Error('Conversation not found or access denied');
    }

    // Get or create read status
    let readStatus = await this.messageReadStatusRepository.findOne({
      where: { userId, conversationId }
    });

    if (!readStatus) {
      readStatus = await this.createMessageReadStatus(userId, conversationId);
    }

    // Update read status
    if (lastMessageId) {
      readStatus.updateReadStatus(lastMessageId);
    } else {
      // Mark all messages as read
      const latestMessage = await this.messageRepository.findOne({
        where: { conversationId },
        order: { createdAt: 'DESC' }
      });
      if (latestMessage) {
        readStatus.updateReadStatus(latestMessage.id);
      }
    }

    await this.messageReadStatusRepository.save(readStatus);

    // Mark individual messages as read
    await this.messageRepository.update(
      {
        conversationId,
        recipientId: userId,
        isRead: false,
        ...(lastMessageId && { id: lastMessageId })
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    // Send real-time update
    const otherParticipantId = conversation.getOtherParticipantId(userId);
    this.socketService.sendToUser(otherParticipantId, 'messages:read', {
      conversationId,
      readByUserId: userId,
      lastMessageId,
    });
  }

  /**
   * Get user's conversations with pagination
   */
  async getUserConversations(userId: number, searchDto: ConversationSearchDto): Promise<PaginatedConversationsResponseDto> {
    const {
      search,
      type,
      listingId,
      hasUnreadMessages,
      sortBy = 'lastMessageAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20
    } = searchDto;

    const queryBuilder = this.conversationRepository.createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participant1', 'participant1')
      .leftJoinAndSelect('conversation.participant2', 'participant2')
      .leftJoinAndSelect('conversation.listing', 'listing')
      .leftJoin('message_read_status', 'readStatus', 
        'readStatus.conversationId = conversation.id AND readStatus.userId = :userId', { userId })
      .where('(conversation.participant1Id = :userId OR conversation.participant2Id = :userId)', { userId })
      .andWhere('conversation.isActive = :isActive', { isActive: true });

    // Apply filters
    if (type) {
      queryBuilder.andWhere('conversation.type = :type', { type });
    }

    if (listingId) {
      queryBuilder.andWhere('conversation.listingId = :listingId', { listingId });
    }

    if (hasUnreadMessages) {
      queryBuilder.andWhere('readStatus.unreadCount > 0');
    }

    if (search) {
      queryBuilder.andWhere(
        '(participant1.firstName ILIKE :search OR participant1.lastName ILIKE :search OR ' +
        'participant2.firstName ILIKE :search OR participant2.lastName ILIKE :search OR ' +
        'conversation.title ILIKE :search OR listing.title ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply sorting
    queryBuilder.orderBy(`conversation.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [conversations, total] = await queryBuilder.getManyAndCount();

    // Get unread counts for each conversation
    const conversationIds = conversations.map(c => c.id);
    const readStatuses = await this.messageReadStatusRepository.find({
      where: { userId, conversationId: { $in: conversationIds } as any }
    });

    const unreadCounts = new Map(readStatuses.map(rs => [rs.conversationId, rs.unreadCount]));

    const data: ConversationResponseDto[] = conversations.map(conversation => ({
      ...conversation.toSummary(userId),
      unreadCount: unreadCounts.get(conversation.id) || 0,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get conversation messages with pagination
   */
  async getConversationMessages(
    userId: number, 
    conversationId: number, 
    searchDto: MessageSearchDto
  ): Promise<ConversationWithMessagesDto> {
    // Verify user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2', 'listing']
    });

    if (!conversation || !conversation.isParticipant(userId)) {
      throw new Error('Conversation not found or access denied');
    }

    const {
      search,
      messageType,
      unreadOnly,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 50,
      beforeMessageId,
      afterMessageId
    } = searchDto;

    const queryBuilder = this.messageRepository.createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', { conversationId })
      .andWhere('message.isDeleted = :isDeleted', { isDeleted: false });

    // Apply filters
    if (messageType) {
      queryBuilder.andWhere('message.messageType = :messageType', { messageType });
    }

    if (unreadOnly) {
      queryBuilder.andWhere('message.recipientId = :userId AND message.isRead = :isRead', 
        { userId, isRead: false });
    }

    if (search) {
      queryBuilder.andWhere('message.content ILIKE :search', { search: `%${search}%` });
    }

    if (beforeMessageId) {
      queryBuilder.andWhere('message.id < :beforeMessageId', { beforeMessageId });
    }

    if (afterMessageId) {
      queryBuilder.andWhere('message.id > :afterMessageId', { afterMessageId });
    }

    // Apply sorting
    queryBuilder.orderBy(`message.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [messages, total] = await queryBuilder.getManyAndCount();

    // Get unread count for conversation
    const readStatus = await this.messageReadStatusRepository.findOne({
      where: { userId, conversationId }
    });

    const conversationData: ConversationResponseDto = {
      ...conversation.toSummary(userId),
      unreadCount: readStatus?.unreadCount || 0,
    };

    return {
      conversation: conversationData,
      messages: messages.map(message => message.toSummary()),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(userId: number, conversationId: number, isTyping: boolean): Promise<void> {
    // Verify user is participant
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2']
    });

    if (!conversation || !conversation.isParticipant(userId)) {
      throw new Error('Conversation not found or access denied');
    }

    const user = conversation.participant1Id === userId ? conversation.participant1 : conversation.participant2;
    
    const typingEvent: TypingEventDto = {
      conversationId,
      userId,
      userName: user.fullName,
      isTyping,
    };

    // Send to other participant
    const otherParticipantId = conversation.getOtherParticipantId(userId);
    this.socketService.sendToUser(otherParticipantId, 'typing:indicator', typingEvent);
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(userId: number, conversationId: number): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['participant1', 'participant2', 'listing']
    });

    if (!conversation || !conversation.isParticipant(userId)) {
      throw new Error('Conversation not found or access denied');
    }

    return conversation;
  }

  /**
   * Create message read status entry
   */
  private async createMessageReadStatus(userId: number, conversationId: number): Promise<MessageReadStatus> {
    const readStatus = this.messageReadStatusRepository.create({
      userId,
      conversationId,
      unreadCount: 0,
    });

    return this.messageReadStatusRepository.save(readStatus);
  }

  /**
   * Update unread count for user
   */
  private async updateUnreadCount(userId: number, conversationId: number): Promise<void> {
    let readStatus = await this.messageReadStatusRepository.findOne({
      where: { userId, conversationId }
    });

    if (!readStatus) {
      readStatus = await this.createMessageReadStatus(userId, conversationId);
    }

    readStatus.incrementUnreadCount();
    await this.messageReadStatusRepository.save(readStatus);
  }

  /**
   * Send real-time notifications for new message
   */
  private async sendRealTimeNotifications(message: Message, conversation: Conversation): Promise<void> {
    const messageEvent: MessageEventDto = {
      conversationId: message.conversationId,
      message: message.toSummary(),
      recipientId: message.recipientId,
    };

    // Send real-time notification via Socket.io
    this.socketService.sendToRoom(`chat:${message.conversationId}`, 'message:new', messageEvent);
    this.socketService.sendToUser(message.recipientId, 'conversation:updated', {
      conversationId: message.conversationId,
      type: 'new_message',
      data: messageEvent,
    });

    // Send push notification if recipient is offline
    if (!this.socketService.isUserOnline(message.recipientId)) {
      try {
        const senderName = message.sender?.fullName || 'Someone';
        const notificationTitle = conversation.type === 'listing_inquiry' && conversation.listing
          ? `Message about: ${conversation.listing.title}`
          : `New message from ${senderName}`;

        await this.firebaseService.sendChatNotification(
          '', // Will be resolved by device tokens
          senderName,
          message.content,
          message.conversationId.toString()
        );
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }
  }
}