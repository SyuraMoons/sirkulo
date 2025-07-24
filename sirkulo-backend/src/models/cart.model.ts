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
import { Listing } from './listing.model';

/**
 * Cart Item entity representing items in a user's shopping cart
 * Stores individual cart items with quantities and calculated prices
 */
@Entity('cart_items')
@Index(['userId', 'listingId'], { unique: true }) // Prevent duplicate items in cart
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  listingId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pricePerUnit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  /**
   * Calculate total price based on quantity and price per unit
   */
  calculateTotalPrice(): void {
    this.totalPrice = this.quantity * this.pricePerUnit;
  }

  /**
   * Check if the requested quantity is available
   */
  isQuantityAvailable(availableQuantity: number): boolean {
    return this.quantity <= availableQuantity;
  }

  /**
   * Get sanitized cart item data for API responses
   */
  toResponseObject(): Partial<CartItem> {
    return {
      id: this.id,
      quantity: this.quantity,
      pricePerUnit: this.pricePerUnit,
      totalPrice: this.totalPrice,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
