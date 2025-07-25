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
import { User } from './user.model';
import { Conversation } from './conversation.model';

/**
 * Message entity for storing individual messages
 */
@Entity('messages')
@Index(['conversationId', 'createdAt'])
@Index(['senderId'])
@Index(['recipientId'])
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['text', 'image', 'file'], default: 'text' })
  messageType: 'text' | 'image' | 'file';

  @Column({ type: 'jsonb', nullable: true })
  attachments: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }[] | null;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  editedAt: Date | null;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
  } | null;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'recipientId' })
  recipient: User;

  @Column()
  recipientId: number;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { eager: false })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  conversationId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Get message summary for API responses
   */
  toSummary() {
    return {
      id: this.id,
      content: this.isDeleted ? '[Message deleted]' : this.content,
      messageType: this.messageType,
      attachments: this.isDeleted ? null : this.attachments,
      isRead: this.isRead,
      readAt: this.readAt,
      isEdited: this.isEdited,
      editedAt: this.editedAt,
      isDeleted: this.isDeleted,
      sender: this.sender ? {
        id: this.sender.id,
        firstName: this.sender.firstName,
        lastName: this.sender.lastName,
        fullName: this.sender.fullName,
      } : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Get preview text for conversation list
   */
  getPreviewText(): string {
    if (this.isDeleted) return '[Message deleted]';
    
    switch (this.messageType) {
      case 'image':
        return '📷 Image';
      case 'file':
        return '📎 File attachment';
      default:
        return this.content.length > 100 
          ? this.content.substring(0, 100) + '...'
          : this.content;
    }
  }

  /**
   * Mark message as read
   */
  markAsRead(): void {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
    }
  }

  /**
   * Mark message as deleted (soft delete)
   */
  markAsDeleted(): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = '[Message deleted]';
    this.attachments = null;
  }

  /**
   * Mark message as edited
   */
  markAsEdited(): void {
    this.isEdited = true;
    this.editedAt = new Date();
  }

  /**
   * Check if message can be edited by user
   */
  canBeEditedBy(userId: number): boolean {
    // Only sender can edit, within 24 hours, and not deleted
    const hoursSinceCreated = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60);
    return this.senderId === userId && !this.isDeleted && hoursSinceCreated < 24;
  }

  /**
   * Check if message can be deleted by user
   */
  canBeDeletedBy(userId: number): boolean {
    // Only sender can delete, and not already deleted
    return this.senderId === userId && !this.isDeleted;
  }
}