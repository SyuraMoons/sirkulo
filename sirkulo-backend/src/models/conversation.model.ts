import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.model';
import { Listing } from './listing.model';
import { Message } from './message.model';

/**
 * Conversation entity for organizing messages between users
 */
@Entity('conversations')
@Index(['participant1Id', 'participant2Id'])
@Index(['participant1Id'])
@Index(['participant2Id'])
@Index(['listingId'])
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'enum', enum: ['direct', 'listing_inquiry'], default: 'direct' })
  type: 'direct' | 'listing_inquiry';

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @Column({ type: 'text', nullable: true })
  lastMessagePreview: string | null;

  @Column({ type: 'integer', default: 0 })
  messageCount: number;

  // Participants
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'participant1Id' })
  participant1: User;

  @Column()
  participant1Id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'participant2Id' })
  participant2: User;

  @Column()
  participant2Id: number;

  // Optional listing reference for listing-specific conversations
  @ManyToOne(() => Listing, { eager: false, nullable: true })
  @JoinColumn({ name: 'listingId' })
  listing: Listing | null;

  @Column({ nullable: true })
  listingId: number | null;

  // Messages in this conversation
  @OneToMany(() => Message, message => message.conversation, { eager: false })
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Get conversation summary for list views
   */
  toSummary(currentUserId: number) {
    const otherParticipant = this.participant1Id === currentUserId ? this.participant2 : this.participant1;
    
    return {
      id: this.id,
      title: this.title || this.getDisplayTitle(currentUserId),
      type: this.type,
      lastMessageAt: this.lastMessageAt,
      lastMessagePreview: this.lastMessagePreview,
      messageCount: this.messageCount,
      otherParticipant: otherParticipant ? {
        id: otherParticipant.id,
        firstName: otherParticipant.firstName,
        lastName: otherParticipant.lastName,
        fullName: otherParticipant.fullName,
      } : null,
      listing: this.listing ? {
        id: this.listing.id,
        title: this.listing.title,
        images: this.listing.getAllImageUrls().slice(0, 1),
      } : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Get display title for conversation
   */
  getDisplayTitle(currentUserId: number): string {
    if (this.title) return this.title;
    
    const otherParticipant = this.participant1Id === currentUserId ? this.participant2 : this.participant1;
    
    if (this.type === 'listing_inquiry' && this.listing) {
      return `Inquiry about: ${this.listing.title}`;
    }
    
    return otherParticipant?.fullName || 'Unknown User';
  }

  /**
   * Check if user is participant in conversation
   */
  isParticipant(userId: number): boolean {
    return this.participant1Id === userId || this.participant2Id === userId;
  }

  /**
   * Get other participant ID
   */
  getOtherParticipantId(currentUserId: number): number {
    return this.participant1Id === currentUserId ? this.participant2Id : this.participant1Id;
  }

  /**
   * Update conversation metadata after new message
   */
  updateLastMessage(messagePreview: string): void {
    this.lastMessageAt = new Date();
    this.lastMessagePreview = messagePreview;
    this.messageCount += 1;
  }
}