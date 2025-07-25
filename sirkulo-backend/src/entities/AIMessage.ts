/**
 * AI Message Entity
 * Stores individual messages within AI conversations
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AIConversation } from './AIConversation';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  ERROR = 'error',
  PROCESSING = 'processing',
}

@Entity('ai_messages')
@Index(['conversationId', 'createdAt'])
@Index(['role'])
@Index(['status'])
export class AIMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'uuid' })
  conversationId: string;

  @Column({
    type: 'enum',
    enum: MessageRole,
    comment: 'Role of the message sender (user, assistant, system)'
  })
  role: MessageRole;

  @Column({
    type: 'text',
    comment: 'The actual message content'
  })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
    comment: 'Current status of the message'
  })
  status: MessageStatus;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Additional metadata for the message (tokens, model info, etc.)'
  })
  metadata: Record<string, any>;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Number of tokens in this message (for cost tracking)'
  })
  tokenCount: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'AI model used to generate this message'
  })
  modelUsed: string;

  @Column({
    type: 'int',
    nullable: true,
    comment: 'Response time in milliseconds for AI-generated messages'
  })
  responseTime: number;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Error message if message processing failed'
  })
  errorMessage: string;

  @Column({
    type: 'float',
    nullable: true,
    comment: 'Confidence score for AI-generated responses (0-1)'
  })
  confidenceScore: number;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Safety ratings and content filtering results'
  })
  safetyRatings: Record<string, any>;

  @Column({
    type: 'boolean',
    default: false,
    comment: 'Whether this message was flagged by content filters'
  })
  flagged: boolean;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Sequential order of this message in the conversation'
  })
  sequenceNumber: number;

  @CreateDateColumn({
    name: 'created_at',
    comment: 'Timestamp when the message was created'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: 'Timestamp when the message was last updated'
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => AIConversation, conversation => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: AIConversation;

  // Helper methods
  /**
   * Mark message as processing
   */
  markAsProcessing(): void {
    this.status = MessageStatus.PROCESSING;
  }

  /**
   * Mark message as sent successfully
   */
  markAsSent(): void {
    this.status = MessageStatus.SENT;
  }

  /**
   * Mark message as delivered
   */
  markAsDelivered(): void {
    this.status = MessageStatus.DELIVERED;
  }

  /**
   * Mark message as error with optional error message
   */
  markAsError(errorMessage?: string): void {
    this.status = MessageStatus.ERROR;
    if (errorMessage) {
      this.errorMessage = errorMessage;
    }
  }

  /**
   * Update message metadata
   */
  updateMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  /**
   * Get message metadata
   */
  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  /**
   * Set AI generation metadata
   */
  setAIMetadata(options: {
    modelUsed?: string;
    tokenCount?: number;
    responseTime?: number;
    confidenceScore?: number;
    safetyRatings?: Record<string, any>;
  }): void {
    if (options.modelUsed) this.modelUsed = options.modelUsed;
    if (options.tokenCount) this.tokenCount = options.tokenCount;
    if (options.responseTime) this.responseTime = options.responseTime;
    if (options.confidenceScore) this.confidenceScore = options.confidenceScore;
    if (options.safetyRatings) this.safetyRatings = options.safetyRatings;
  }

  /**
   * Check if message content should be flagged
   */
  checkContentSafety(): boolean {
    // This would integrate with content moderation
    // For now, just check if explicitly flagged
    return this.flagged;
  }

  /**
   * Get formatted message for display
   */
  getFormattedContent(): string {
    if (this.status === MessageStatus.ERROR) {
      return `Error: ${this.errorMessage || 'Message processing failed'}`;
    }
    
    if (this.status === MessageStatus.PROCESSING) {
      return 'Processing...';
    }

    return this.content;
  }

  /**
   * Check if this is a user message
   */
  isUserMessage(): boolean {
    return this.role === MessageRole.USER;
  }

  /**
   * Check if this is an assistant message
   */
  isAssistantMessage(): boolean {
    return this.role === MessageRole.ASSISTANT;
  }

  /**
   * Check if this is a system message
   */
  isSystemMessage(): boolean {
    return this.role === MessageRole.SYSTEM;
  }

  /**
   * Get message cost estimate (if token count is available)
   */
  getEstimatedCost(): number {
    if (!this.tokenCount) return 0;
    
    // Example pricing (adjust based on actual Gemini pricing)
    const costPerToken = 0.00001; // $0.00001 per token
    return this.tokenCount * costPerToken;
  }
}