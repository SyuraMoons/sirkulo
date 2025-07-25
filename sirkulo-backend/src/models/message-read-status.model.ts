import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from './user.model';
import { Conversation } from './conversation.model';

/**
 * Message read status tracking for group conversations
 */
@Entity('message_read_status')
@Unique(['userId', 'conversationId'])
@Index(['conversationId'])
export class MessageReadStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', default: 0 })
  unreadCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  lastReadMessageId: number | null;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: number;

  @ManyToOne(() => Conversation, { eager: false })
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column()
  @Index()
  conversationId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Update read status when user reads messages
   */
  updateReadStatus(lastMessageId: number): void {
    this.lastReadMessageId = lastMessageId;
    this.lastReadAt = new Date();
    this.unreadCount = 0;
  }

  /**
   * Increment unread count when new message arrives
   */
  incrementUnreadCount(): void {
    this.unreadCount += 1;
  }
}