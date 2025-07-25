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
import { Listing } from './listing.model';

/**
 * Rating entity representing user ratings for listings
 */
@Entity('ratings')
@Unique(['userId', 'listingId']) // Prevent duplicate ratings from same user
@Index(['listingId', 'rating']) // Optimize rating queries
@Index(['userId'])
@Index(['listingId'])
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', width: 1 })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Relations
  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Listing, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @Column()
  listingId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Get rating summary for display
   */
  toSummary() {
    return {
      id: this.id,
      rating: this.rating,
      comment: this.comment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      user: this.user ? {
        id: this.user.id,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        fullName: this.user.fullName,
      } : null,
    };
  }

  /**
   * Validate rating value
   */
  static isValidRating(rating: number): boolean {
    return Number.isInteger(rating) && rating >= 1 && rating <= 5;
  }
}