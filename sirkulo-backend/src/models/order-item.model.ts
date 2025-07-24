import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index
} from 'typeorm';
import { Listing } from './listing.model';

// Forward reference to avoid circular import
type Order = import('./order.model').Order;

/**
 * OrderItem entity representing individual items within an order
 */
@Entity('order_items')
@Index(['orderId'])
@Index(['listingId'])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  orderId!: number;

  @ManyToOne('Order', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  listingId!: number;

  @ManyToOne(() => Listing, { eager: true })
  @JoinColumn({ name: 'listingId' })
  listing!: Listing;

  // Item details at time of order (preserved for historical accuracy)
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  wasteType!: string;

  @Column({ type: 'varchar', length: 20 })
  unit!: string;

  // Quantity and pricing
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  pricePerUnit!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPrice!: number;

  // Snapshot of business info at time of order
  @Column({ type: 'jsonb' })
  businessSnapshot!: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile: {
      companyName: string;
      businessType: string;
      description?: string;
    };
  };

  // Additional item information
  @Column({ type: 'jsonb', nullable: true })
  specifications?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Calculate total price for this item
   */
  calculateTotalPrice(): number {
    return Number((this.quantity * this.pricePerUnit).toFixed(2));
  }

  /**
   * Create OrderItem from CartItem
   */
  static fromCartItem(cartItem: any, order: Order): Partial<OrderItem> {
    return {
      order,
      listingId: cartItem.listing.id,
      listing: cartItem.listing,
      title: cartItem.listing.title,
      description: cartItem.listing.description,
      wasteType: cartItem.listing.wasteType,
      unit: cartItem.listing.unit,
      quantity: cartItem.quantity,
      pricePerUnit: cartItem.pricePerUnit,
      totalPrice: cartItem.totalPrice,
      businessSnapshot: {
        id: cartItem.listing.business.id,
        firstName: cartItem.listing.business.firstName,
        lastName: cartItem.listing.business.lastName,
        businessProfile: {
          companyName: cartItem.listing.business.businessProfile?.companyName || '',
          businessType: cartItem.listing.business.businessProfile?.businessType || '',
          description: cartItem.listing.business.businessProfile?.description
        }
      },
      specifications: cartItem.listing.specifications,
      notes: cartItem.notes
    };
  }

  /**
   * Convert to response object
   */
  toResponseObject() {
    return {
      id: this.id,
      listing: {
        id: this.listing.id,
        title: this.title,
        description: this.description,
        wasteType: this.wasteType,
        unit: this.unit,
        images: this.listing.images || []
      },
      quantity: this.quantity,
      pricePerUnit: this.pricePerUnit,
      totalPrice: this.totalPrice,
      business: this.businessSnapshot,
      specifications: this.specifications,
      notes: this.notes,
      createdAt: this.createdAt
    };
  }
}
