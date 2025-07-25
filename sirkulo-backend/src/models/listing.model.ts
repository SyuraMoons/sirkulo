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
import { 
  WasteType, 
  ListingStatus, 
  ListingCategory, 
  ProjectDifficulty, 
  VolunteerRequirement, 
  CraftMaterial, 
  CraftCategory 
} from '../types';

/**
 * Listing entity representing all types of listings in the Sirkulo platform
 * Supports waste materials, recycling projects, and upcycled crafts
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
    enum: ListingCategory,
    default: ListingCategory.WASTE,
  })
  category: ListingCategory;

  @Column({
    type: 'enum',
    enum: WasteType,
    nullable: true,
  })
  wasteType: WasteType | null;

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

  // Project-specific fields
  @Column({
    type: 'enum',
    enum: ProjectDifficulty,
    nullable: true,
  })
  projectDifficulty: ProjectDifficulty | null;

  @Column({
    type: 'enum',
    enum: VolunteerRequirement,
    nullable: true,
  })
  volunteerRequirement: VolunteerRequirement | null;

  @Column({ type: 'integer', nullable: true })
  volunteersNeeded: number | null;

  @Column({ type: 'integer', default: 0 })
  volunteersApplied: number;

  @Column({ type: 'timestamp', nullable: true })
  projectStartDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  projectEndDate: Date | null;

  @Column({ type: 'text', nullable: true })
  projectRequirements: string | null;

  @Column({ type: 'text', nullable: true })
  expectedOutcome: string | null;

  @Column({ type: 'jsonb', nullable: true })
  projectLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  } | null;

  // Crafts-specific fields
  @Column({
    type: 'enum',
    enum: CraftMaterial,
    nullable: true,
  })
  craftMaterial: CraftMaterial | null;

  @Column({
    type: 'enum',
    enum: CraftCategory,
    nullable: true,
  })
  craftCategory: CraftCategory | null;

  @Column({ type: 'text', nullable: true })
  craftingTechnique: string | null;

  @Column({ type: 'text', nullable: true })
  dimensions: string | null;

  @Column({ type: 'text', nullable: true })
  careInstructions: string | null;

  @Column({ type: 'boolean', default: false })
  isCustomizable: boolean;

  @Column({ type: 'integer', nullable: true })
  estimatedCraftingTime: number | null; // in hours

  @Column({ type: 'text', nullable: true })
  artistName: string | null;

  @Column({ type: 'text', nullable: true })
  artistBio: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @Column({ type: 'integer', default: 0 })
  inquiryCount: number;

  // Rating aggregates (calculated fields)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'integer', default: 0 })
  totalRatings: number;

  // Relations
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'businessId' })
  business: User;

  @Column()
  @Index()
  businessId: number;

  @OneToMany(() => Image, image => image.listing, { eager: false, cascade: true })
  imageEntities: Image[];

  @OneToMany('Rating', 'listing', { eager: false })
  ratings: any[];

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
    const baseData = {
      id: this.id,
      title: this.title,
      category: this.category,
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
      averageRating: this.averageRating || 0,
      totalRatings: this.totalRatings || 0,
      createdAt: this.createdAt,
      business: this.business ? {
        id: this.business.id,
        firstName: this.business.firstName || '',
        lastName: this.business.lastName || '',
        businessProfile: this.business.businessProfile,
      } : null,
    };

    // Add category-specific fields
    if (this.category === ListingCategory.PROJECT) {
      return {
        ...baseData,
        projectDifficulty: this.projectDifficulty,
        volunteerRequirement: this.volunteerRequirement,
        volunteersNeeded: this.volunteersNeeded,
        volunteersApplied: this.volunteersApplied,
        projectStartDate: this.projectStartDate,
        projectEndDate: this.projectEndDate,
        projectLocation: this.projectLocation,
        expectedOutcome: this.expectedOutcome,
      };
    }

    if (this.category === ListingCategory.CRAFTS) {
      return {
        ...baseData,
        craftMaterial: this.craftMaterial,
        craftCategory: this.craftCategory,
        craftingTechnique: this.craftingTechnique,
        dimensions: this.dimensions,
        isCustomizable: this.isCustomizable,
        artistName: this.artistName,
        estimatedCraftingTime: this.estimatedCraftingTime,
      };
    }

    return baseData;
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

  /**
   * Update rating aggregates
   */
  updateRatingAggregates(averageRating: number, totalRatings: number): void {
    this.averageRating = averageRating;
    this.totalRatings = totalRatings;
  }

  /**
   * Check if listing is a project
   */
  isProject(): boolean {
    return this.category === ListingCategory.PROJECT;
  }

  /**
   * Check if listing is a craft
   */
  isCraft(): boolean {
    return this.category === ListingCategory.CRAFTS;
  }

  /**
   * Check if listing is a waste listing
   */
  isWaste(): boolean {
    return this.category === ListingCategory.WASTE;
  }

  /**
   * Check if project is accepting volunteers
   */
  isAcceptingVolunteers(): boolean {
    if (!this.isProject()) return false;
    
    if (!this.isActive || this.status !== ListingStatus.ACTIVE) {
      return false;
    }

    if (this.volunteersNeeded && this.volunteersApplied >= this.volunteersNeeded) {
      return false;
    }

    const now = new Date();
    if (this.projectStartDate && this.projectStartDate <= now) {
      return false; // Project has already started
    }

    return true;
  }

  /**
   * Apply for project volunteer position
   */
  applyForVolunteer(): void {
    if (this.isProject() && this.isAcceptingVolunteers()) {
      this.volunteersApplied += 1;
    }
  }

  /**
   * Check if craft is available for purchase
   */
  isCraftAvailableForPurchase(): boolean {
    if (!this.isCraft()) return false;
    return this.isAvailableForPurchase();
  }

  /**
   * Get target audience for the listing
   */
  getTargetAudience(): string[] {
    if (this.isProject()) {
      return ['recycler']; // Projects are only for recyclers
    }
    
    if (this.isCraft()) {
      return ['user', 'recycler']; // Crafts are for both regular users and recyclers
    }
    
    return ['user', 'recycler', 'business']; // Waste listings are for all
  }

  /**
   * Get listing type specific validation
   */
  validateListingType(): string[] {
    const errors: string[] = [];

    if (this.isProject()) {
      if (!this.projectDifficulty) errors.push('Project difficulty is required');
      if (!this.volunteerRequirement) errors.push('Volunteer requirement is required');
      if (!this.volunteersNeeded || this.volunteersNeeded <= 0) errors.push('Number of volunteers needed must be greater than 0');
      if (!this.projectStartDate) errors.push('Project start date is required');
      if (!this.expectedOutcome) errors.push('Expected outcome is required');
    }

    if (this.isCraft()) {
      if (!this.craftMaterial) errors.push('Craft material is required');
      if (!this.craftCategory) errors.push('Craft category is required');
      if (!this.pricePerUnit || this.pricePerUnit <= 0) errors.push('Price is required for craft listings');
    }

    if (this.isWaste()) {
      if (!this.wasteType) errors.push('Waste type is required for waste listings');
      if (!this.quantity || this.quantity <= 0) errors.push('Quantity must be greater than 0');
    }

    return errors;
  }
}