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
import { Image } from './image.model';
import { WasteType, ListingStatus } from '../types';

/**
 * Listing entity representing waste materials posted by businesses
 */
@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: WasteType,
  })
  wasteType: WasteType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'varchar', length: 20 })
  unit: string; // kg, tons, pieces, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerUnit: number | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  totalPrice: number | null;

  @Column({ type: 'boolean', default: false })
  isNegotiable: boolean;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @Column({ type: 'jsonb' })
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @Column({ type: 'text', array: true, default: [] })
  images: string[];

  @Column({ type: 'jsonb', nullable: true })
  specifications: {
    color?: string;
    material?: string;
    condition?: string;
    origin?: string;
    additionalInfo?: Record<string, any>;
  } | null;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date | null;

  @Column({ type: 'text', nullable: true })
  pickupInstructions: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'integer', default: 0 })
  inquiryCount: number;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'businessId' })
  business: User;

  @Column()
  @Index()
  businessId: number;

  @OneToMany(() => Image, image => image.listing, { eager: false, cascade: true })
  imageEntities: Image[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Get image URLs from both legacy images array and new Image entities
   */
  getAllImageUrls(): string[] {
    const legacyImages = this.images || [];
    const entityImages = this.imageEntities ? 
      this.imageEntities
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(img => img.url) : [];
    
    // Combine and deduplicate
    return [...new Set([...legacyImages, ...entityImages])];
  }

  /**
   * Get thumbnail URLs from Image entities
   */
  getThumbnailUrls(): string[] {
    return this.imageEntities ? 
      this.imageEntities
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(img => img.thumbnailUrl) : [];
  }

  /**
   * Get listing summary for list views
   */
  toSummary() {
    return {
      id: this.id,
      title: this.title,
      wasteType: this.wasteType,
      quantity: this.quantity,
      unit: this.unit,
      pricePerUnit: this.pricePerUnit,
      totalPrice: this.totalPrice,
      isNegotiable: this.isNegotiable,
      status: this.status,
      location: {
        city: this.location.city,
        state: this.location.state,
        country: this.location.country,
      },
      images: this.getAllImageUrls().slice(0, 1), // Only first image for summary
      createdAt: this.createdAt,
      business: this.business ? {
        id: this.business.id,
        firstName: this.business.firstName || '',
        lastName: this.business.lastName || '',
        businessProfile: this.business.businessProfile,
      } : null,
    };
  }

  /**
   * Check if listing is available for purchase
   */
  isAvailableForPurchase(): boolean {
    if (!this.isActive || this.status !== ListingStatus.ACTIVE) {
      return false;
    }

    const now = new Date();
    
    if (this.availableFrom && this.availableFrom > now) {
      return false;
    }

    if (this.availableUntil && this.availableUntil < now) {
      return false;
    }

    return true;
  }

  /**
   * Increment view count
   */
  incrementViewCount(): void {
    this.viewCount += 1;
  }

  /**
   * Increment inquiry count
   */
  incrementInquiryCount(): void {
    this.inquiryCount += 1;
  }
}
