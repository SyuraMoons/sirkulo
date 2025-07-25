/**
 * AI Conversation Entity
 * Stores conversation history between users and AI assistant
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../models/user.model';
import { AIMessage } from './AIMessage';

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum ConversationType {
  GENERAL = 'general',
  PRODUCT_INQUIRY = 'product_inquiry',
  ORDER_SUPPORT = 'order_support',
  RECOMMENDATION = 'recommendation',
  TECHNICAL_SUPPORT = 'technical_support',
}

@Entity('ai_conversations')
@Index(['userId', 'status'])
@Index(['createdAt'])
export class AIConversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Human-readable title for the conversation'
  })
  title: string;

  @Column({
    type: 'enum',
    enum: ConversationType,
    default: ConversationType.GENERAL,
    comment: 'Type of conversation for better context handling'
  })
  type: ConversationType;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
    comment: 'Current status of the conversation'
  })
  status: ConversationStatus;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Additional context or metadata for the conversation'
  })
  context?: string;

  @Column({
    type: 'json',
    nullable: true,
    comment: 'Structured metadata for conversation context'
  })
  metadata: Record<string, any>;

  @Column({
    type: 'int',
    default: 0,
    comment: 'Total number of messages in this conversation'
  })
  messageCount: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    comment: 'Timestamp of the last message in this conversation'
  })
  lastMessageAt: Date;

  @CreateDateColumn({
    name: 'created_at',
    comment: 'Timestamp when the conversation was created'
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    comment: 'Timestamp when the conversation was last updated'
  })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user: User) => user.aiConversations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => AIMessage, message => message.conversation, {
    cascade: true,
  })
  messages: AIMessage[];

  // Helper methods
  /**
   * Update conversation metadata
   */
  updateMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
  }

  /**
   * Get conversation metadata
   */
  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  /**
   * Archive the conversation
   */
  archive(): void {
    this.status = ConversationStatus.ARCHIVED;
  }

  /**
   * Activate the conversation
   */
  activate(): void {
    this.status = ConversationStatus.ACTIVE;
  }

  /**
   * Soft delete the conversation
   */
  softDelete(): void {
    this.status = ConversationStatus.DELETED;
  }

  /**
   * Update message count and last message timestamp
   */
  updateMessageStats(messageCount: number, lastMessageAt: Date): void {
    this.messageCount = messageCount;
    this.lastMessageAt = lastMessageAt;
  }

  /**
   * Generate conversation title based on first message or type
   */
  generateTitle(firstMessage?: string): string {
    if (firstMessage && firstMessage.length > 0) {
      // Take first 50 characters and add ellipsis if longer
      return firstMessage.length > 50 
        ? firstMessage.substring(0, 47) + '...'
        : firstMessage;
    }

    // Fallback to type-based title
    const typeLabels = {
      [ConversationType.GENERAL]: 'General Chat',
      [ConversationType.PRODUCT_INQUIRY]: 'Product Inquiry',
      [ConversationType.ORDER_SUPPORT]: 'Order Support',
      [ConversationType.RECOMMENDATION]: 'Recommendations',
      [ConversationType.TECHNICAL_SUPPORT]: 'Technical Support',
    };

    return typeLabels[this.type] || 'AI Conversation';
  }
}