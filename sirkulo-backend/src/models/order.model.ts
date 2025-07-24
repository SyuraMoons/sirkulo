import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { User } from './user.model';
import { OrderStatus, PaymentStatus } from '../types/enums';

// Forward reference type for OrderItem
type OrderItem = any;

/**
 * Order entity representing a purchase transaction
 */
@Entity('orders')
@Index(['buyerId'])
@Index(['sellerId']) 
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  orderNumber!: string;

  // Buyer (recycler/user purchasing waste)
  @Column()
  buyerId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'buyerId' })
  buyer!: User;

  // Seller (business selling waste)
  @Column()
  sellerId!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller!: User;

  @OneToMany('OrderItem', 'order', {
    cascade: true,
    eager: true
  })
  items!: OrderItem[];  @Column({ 
    type: 'enum', 
    enum: OrderStatus, 
    default: OrderStatus.PENDING 
  })
  status!: OrderStatus;

  @Column({ 
    type: 'enum', 
    enum: PaymentStatus, 
    default: PaymentStatus.PENDING 
  })
  paymentStatus!: PaymentStatus;

  // Financial details
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingCost!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: number;

  // Shipping and delivery information
  @Column({ type: 'jsonb', nullable: true })
  shippingAddress!: {
    address: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ type: 'varchar', length: 100, nullable: true })
  shippingMethod?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  trackingNumber?: string;

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  shippedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  // Additional information
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Generate unique order number
   */
  static generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD-${timestamp.toUpperCase()}-${random.toUpperCase()}`;
  }

  /**
   * Calculate total amount from items
   */
  calculateTotalAmount(): number {
    const subtotal = this.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;
    return subtotal + (this.shippingCost || 0) + (this.taxAmount || 0);
  }

  /**
   * Check if order can be cancelled
   */
  canBeCancelled(): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(this.status);
  }

  /**
   * Check if order can be modified
   */
  canBeModified(): boolean {
    return this.status === OrderStatus.PENDING;
  }

  /**
   * Get order status display text
   */
  getStatusDisplay(): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Pending Confirmation',
      [OrderStatus.CONFIRMED]: 'Confirmed',
      [OrderStatus.PREPARING]: 'Preparing',
      [OrderStatus.PROCESSING]: 'Processing',
      [OrderStatus.SHIPPED]: 'Shipped',
      [OrderStatus.DELIVERED]: 'Delivered',
      [OrderStatus.CANCELLED]: 'Cancelled',
      [OrderStatus.REFUNDED]: 'Refunded'
    };
    return statusMap[this.status] || this.status;
  }

  /**
   * Convert to response object
   */
  toResponseObject() {
    return {
      id: this.id,
      orderNumber: this.orderNumber,
      status: this.status,
      statusDisplay: this.getStatusDisplay(),
      paymentStatus: this.paymentStatus,
      buyer: {
        id: this.buyer.id,
        firstName: this.buyer.firstName,
        lastName: this.buyer.lastName,
        email: this.buyer.email,
        businessProfile: this.buyer.businessProfile,
        recyclerProfile: this.buyer.recyclerProfile
      },
      seller: {
        id: this.seller.id,
        firstName: this.seller.firstName,
        lastName: this.seller.lastName,
        email: this.seller.email,
        businessProfile: this.seller.businessProfile
      },
      items: this.items?.map(item => item.toResponseObject()) || [],
      financials: {
        subtotal: this.subtotal,
        shippingCost: this.shippingCost,
        taxAmount: this.taxAmount,
        totalAmount: this.totalAmount
      },
      shipping: {
        address: this.shippingAddress,
        method: this.shippingMethod,
        trackingNumber: this.trackingNumber
      },
      dates: {
        createdAt: this.createdAt,
        confirmedAt: this.confirmedAt,
        shippedAt: this.shippedAt,
        deliveredAt: this.deliveredAt,
        cancelledAt: this.cancelledAt
      },
      notes: this.notes,
      cancellationReason: this.cancellationReason,
      canBeCancelled: this.canBeCancelled(),
      canBeModified: this.canBeModified()
    };
  }
}
