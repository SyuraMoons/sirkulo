/**
 * AI Conversation Service
 * Handles AI conversation management and message processing
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { AIConversation, ConversationType, ConversationStatus } from '../entities/AIConversation';
import { AIMessage, MessageRole, MessageStatus } from '../entities/AIMessage';
import { User } from '../models/user.model';
import { geminiConfig } from '../config/gemini.config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CreateConversationOptions {
  userId: number;
  type?: ConversationType;
  title?: string;
  context?: string;
  metadata?: Record<string, any>;
}

export interface SendMessageOptions {
  conversationId: string;
  content: string;
  role?: MessageRole;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  success: boolean;
  message?: AIMessage;
  error?: string;
  metadata?: {
    tokenCount?: number;
    responseTime?: number;
    modelUsed?: string;
    safetyRatings?: Record<string, any>;
  };
}

export class AIConversationService {
  private conversationRepository: Repository<AIConversation>;
  private messageRepository: Repository<AIMessage>;
  private userRepository: Repository<User>;
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.conversationRepository = AppDataSource.getRepository(AIConversation);
    this.messageRepository = AppDataSource.getRepository(AIMessage);
    this.userRepository = AppDataSource.getRepository(User);
    
    // Initialize Google Generative AI
    this.genAI = new GoogleGenerativeAI(geminiConfig.apiKey);
  }

  /**
   * Create a new AI conversation
   */
  async createConversation(options: CreateConversationOptions): Promise<AIConversation> {
    const { userId, type = ConversationType.GENERAL, title, context, metadata } = options;

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const conversation = new AIConversation();
    conversation.userId = userId.toString();
    conversation.type = type;
    conversation.title = title || conversation.generateTitle();
    conversation.context = context;
    conversation.metadata = metadata || {};
    conversation.status = ConversationStatus.ACTIVE;

    return await this.conversationRepository.save(conversation);
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<AIConversation | null> {
    return await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user', 'messages'],
      order: { messages: { createdAt: 'ASC' } }
    });
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(
    userId: number,
    status: ConversationStatus = ConversationStatus.ACTIVE,
    limit: number = 50,
    offset: number = 0
  ): Promise<AIConversation[]> {
    return await this.conversationRepository.find({
      where: { userId: userId.toString(), status },
      order: { updatedAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['messages']
    });
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(options: SendMessageOptions): Promise<AIResponse> {
    const { conversationId, content, role = MessageRole.USER, metadata } = options;

    try {
      // Get conversation
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        return { success: false, error: 'Conversation not found' };
      }

      // Create user message
      const userMessage = await this.createMessage({
        conversationId,
        role,
        content,
        metadata
      });

      // If it's a user message, generate AI response
      if (role === MessageRole.USER) {
        const aiResponse = await this.generateAIResponse(conversation, userMessage);
        return aiResponse;
      }

      return { success: true, message: userMessage };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Generate AI response using Gemini
   */
  private async generateAIResponse(
    conversation: AIConversation,
    userMessage: AIMessage
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Create AI message with processing status
      const aiMessage = await this.createMessage({
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content: '',
        status: MessageStatus.PROCESSING
      });

      // Get model
      const model = this.genAI.getGenerativeModel({
        model: geminiConfig.model,
        generationConfig: geminiConfig.generationConfig,
        safetySettings: geminiConfig.safetySettings as any
      });

      // Build conversation history for context
      const history = await this.buildConversationHistory(conversation);
      
      // Generate response
      const chat = model.startChat({
        history: history,
        generationConfig: geminiConfig.generationConfig,
        safetySettings: geminiConfig.safetySettings as any
      });

      const result = await chat.sendMessage(userMessage.content);
      const response = await result.response;
      const responseText = response.text();

      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Update AI message with response
      aiMessage.content = responseText;
      aiMessage.status = MessageStatus.SENT;
      aiMessage.setAIMetadata({
        modelUsed: geminiConfig.model,
        responseTime,
        safetyRatings: response.candidates?.[0]?.safetyRatings || {}
      });

      await this.messageRepository.save(aiMessage);

      // Update conversation stats
      await this.updateConversationStats(conversation.id);

      return {
        success: true,
        message: aiMessage,
        metadata: {
          tokenCount: aiMessage.tokenCount,
          responseTime,
          modelUsed: geminiConfig.model,
          safetyRatings: aiMessage.safetyRatings
        }
      };

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Update AI message with error
      const aiMessage = await this.messageRepository.findOne({
        where: { conversationId: conversation.id, role: MessageRole.ASSISTANT },
        order: { createdAt: 'DESC' }
      });

      if (aiMessage) {
        aiMessage.markAsError((error as Error).message);
        await this.messageRepository.save(aiMessage);
      }

      return {
        success: false,
        error: (error as Error).message,
        message: aiMessage || undefined
      };
    }
  }

  /**
   * Create a new message
   */
  private async createMessage(options: {
    conversationId: string;
    role: MessageRole;
    content: string;
    status?: MessageStatus;
    metadata?: Record<string, any>;
  }): Promise<AIMessage> {
    const { conversationId, role, content, status = MessageStatus.SENT, metadata } = options;

    // Get next sequence number
    const messageCount = await this.messageRepository.count({
      where: { conversationId }
    });

    const message = new AIMessage();
    message.conversationId = conversationId;
    message.role = role;
    message.content = content;
    message.status = status;
    message.metadata = metadata || {};
    message.sequenceNumber = messageCount + 1;

    return await this.messageRepository.save(message);
  }

  /**
   * Build conversation history for AI context
   */
  private async buildConversationHistory(conversation: AIConversation): Promise<any[]> {
    const messages = await this.messageRepository.find({
      where: { conversationId: conversation.id },
      order: { createdAt: 'ASC' },
      take: 50 // Limit history to prevent token overflow
    });

    return messages.map(message => ({
      role: message.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: message.content }]
    }));
  }

  /**
   * Update conversation statistics
   */
  private async updateConversationStats(conversationId: string): Promise<void> {
    const messageCount = await this.messageRepository.count({
      where: { conversationId }
    });

    const lastMessage = await this.messageRepository.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' }
    });

    await this.conversationRepository.update(conversationId, {
      messageCount,
      lastMessageAt: lastMessage?.createdAt,
      updatedAt: new Date()
    });
  }

  /**
   * Archive a conversation
   */
  async archiveConversation(conversationId: string): Promise<boolean> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        return false;
      }

      conversation.archive();
      await this.conversationRepository.save(conversation);
      return true;
    } catch (error) {
      console.error('Error archiving conversation:', error);
      return false;
    }
  }

  /**
   * Delete a conversation (soft delete)
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        return false;
      }

      conversation.softDelete();
      await this.conversationRepository.save(conversation);
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(conversationId: string): Promise<{
    messageCount: number;
    userMessages: number;
    aiMessages: number;
    averageResponseTime: number;
    totalTokens: number;
  } | null> {
    try {
      const messages = await this.messageRepository.find({
        where: { conversationId }
      });

      if (messages.length === 0) {
        return null;
      }

      const userMessages = messages.filter(m => m.role === MessageRole.USER).length;
      const aiMessages = messages.filter(m => m.role === MessageRole.ASSISTANT).length;
      const totalTokens = messages.reduce((sum, m) => sum + (m.tokenCount || 0), 0);
      
      const responseTimes = messages
        .filter(m => m.role === MessageRole.ASSISTANT && m.responseTime)
        .map(m => m.responseTime);
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      return {
        messageCount: messages.length,
        userMessages,
        aiMessages,
        averageResponseTime,
        totalTokens
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return null;
    }
  }
}