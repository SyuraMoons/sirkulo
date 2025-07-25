import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany
} from 'typeorm';
import { Order } from './order.model';
import { User } from './user.model';
import { XenditPaymentMethod, XenditPaymentStatus } from '../types/payment.dto';

/**
 * Payment entity for tracking Xendit payments
 */
@Entity('payments')
@Index(['orderId'])
@Index(['xenditInvoiceId'])
@Index(['xenditPaymentId'])
@Index(['status'])
@Index(['createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  orderId!: number;

  @ManyToOne(() => Order, { eager: false })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  userId!: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  // Xendit identifiers
  @Column({ type: 'varchar', length: 100, nullable: true })
  xenditInvoiceId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  xenditPaymentId?: string;

  // Payment details
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'IDR' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: XenditPaymentStatus,
    default: XenditPaymentStatus.PENDING
  })
  status!: XenditPaymentStatus;

  @Column({
    type: 'enum',
    enum: XenditPaymentMethod
  })
  paymentMethod!: XenditPaymentMethod;

  // Payment URLs and details
  @Column({ type: 'text', nullable: true })
  paymentUrl?: string;

  @Column({ type: 'text', nullable: true })
  qrString?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  virtualAccountNumber?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  retailOutletCode?: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  bankCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ewalletType?: string;

  // Customer information
  @Column({ type: 'jsonb' })
  customerInfo!: {
    givenNames: string;
    surname?: string;
    email: string;
    mobileNumber?: string;
    address?: {
      country: string;
      streetLine1: string;
      streetLine2?: string;
      city: string;
      province: string;
      postalCode?: string;
    };
  };

  // Payment lifecycle dates
  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  settledAt?: Date;

  // Failure information
  @Column({ type: 'varchar', length: 50, nullable: true })
  failureCode?: string;

  @Column({ type: 'text', nullable: true })
  failureMessage?: string;

  // Additional metadata
  @Column({ type: 'jsonb', nullable: true })
  xenditResponse?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => Refund, refund => refund.payment, { cascade: true })
  refunds!: Refund[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Check if payment is expired
   */
  isExpired(): boolean {
    return this.expiryDate ? new Date() > this.expiryDate : false;
  }

  /**
   * Check if payment can be refunded
   */
  canBeRefunded(): boolean {
    return [XenditPaymentStatus.PAID, XenditPaymentStatus.SETTLED].includes(this.status);
  }

  /**
   * Get remaining refundable amount
   */
  getRefundableAmount(): number {
    const totalRefunded = this.refunds
      ?.filter(refund => refund.status === 'COMPLETED')
      .reduce((sum, refund) => sum + refund.amount, 0) || 0;
    return this.amount - totalRefunded;
  }

  /**
   * Convert to response object
   */
  toResponseObject() {
    return {
      id: this.id,
      orderId: this.orderId,
      xenditInvoiceId: this.xenditInvoiceId,
      xenditPaymentId: this.xenditPaymentId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      paymentMethod: this.paymentMethod,
      paymentUrl: this.paymentUrl,
      qrString: this.qrString,
      virtualAccountNumber: this.virtualAccountNumber,
      retailOutletCode: this.retailOutletCode,
      bankCode: this.bankCode,
      ewalletType: this.ewalletType,
      customerInfo: this.customerInfo,
      expiryDate: this.expiryDate,
      paidAt: this.paidAt,
      settledAt: this.settledAt,
      failureCode: this.failureCode,
      failureMessage: this.failureMessage,
      refundableAmount: this.getRefundableAmount(),
      canBeRefunded: this.canBeRefunded(),
      isExpired: this.isExpired(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

/**
 * Refund entity for tracking payment refunds
 */
@Entity('refunds')
@Index(['paymentId'])
@Index(['xenditRefundId'])
@Index(['status'])
@Index(['createdAt'])
export class Refund {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  paymentId!: string;

  @ManyToOne(() => Payment, payment => payment.refunds)
  @JoinColumn({ name: 'paymentId' })
  payment!: Payment;

  @Column({ type: 'varchar', length: 100, nullable: true })
  xenditRefundId?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'IDR' })
  currency!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string; // PENDING, COMPLETED, FAILED

  @Column({ type: 'text' })
  reason!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  failureCode?: string;

  @Column({ type: 'text', nullable: true })
  failureMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  xenditResponse?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Convert to response object
   */
  toResponseObject() {
    return {
      id: this.id,
      paymentId: this.paymentId,
      xenditRefundId: this.xenditRefundId,
      amount: this.amount,
      currency: this.currency,
      status: this.status,
      reason: this.reason,
      notes: this.notes,
      failureCode: this.failureCode,
      failureMessage: this.failureMessage,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}