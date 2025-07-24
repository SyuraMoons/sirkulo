import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { User } from './user.model';
import { Listing } from './listing.model';

/**
 * Image entity for storing uploaded files
 */
@Entity('images')
@Index(['filename'])
@Index(['uploadedBy'])
@Index(['entityType', 'entityId'])
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  filename!: string;

  @Column({ type: 'varchar', length: 255 })
  originalName!: string;

  @Column({ type: 'varchar', length: 100 })
  mimetype!: string;

  @Column({ type: 'integer' })
  size!: number;

  @Column({ type: 'varchar', length: 500 })
  url!: string;

  @Column({ type: 'varchar', length: 500 })
  thumbnailUrl!: string;

  @Column({ type: 'text', nullable: true })
  caption?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  altText?: string;

  @Column({ type: 'integer', default: 0 })
  displayOrder!: number;

  // Image metadata
  @Column({ type: 'integer', nullable: true })
  width?: number;

  @Column({ type: 'integer', nullable: true })
  height?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  format?: string;

  // Related entity information (listing, user, etc.)
  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType?: string; // 'listing', 'user', 'business'

  @Column({ type: 'integer', nullable: true })
  entityId?: number;

  // Upload information
  @Column()
  uploadedBy!: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'uploadedBy' })
  uploader!: User;

  // Optional listing relationship
  @ManyToOne(() => Listing, { eager: false, nullable: true })
  @JoinColumn({ name: 'listingId' })
  listing?: Listing;

  @Column({ nullable: true })
  @Index()
  listingId?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Get public URL for the image
   */
  getPublicUrl(): string {
    return this.url;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(): string {
    return this.thumbnailUrl;
  }

  /**
   * Get image dimensions as string
   */
  getDimensions(): string | null {
    if (this.width && this.height) {
      return `${this.width}x${this.height}`;
    }
    return null;
  }

  /**
   * Get file size in human readable format
   */
  getFormattedSize(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
  }

  /**
   * Check if image is associated with an entity
   */
  isAssociated(): boolean {
    return !!(this.entityType && this.entityId);
  }

  /**
   * Create image from upload data
   */
  static create(data: {
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
    thumbnailUrl: string;
    uploadedBy: number;
    width?: number;
    height?: number;
    format?: string;
    caption?: string;
    altText?: string;
    displayOrder?: number;
    entityType?: string;
    entityId?: number;
  }): Image {
    const image = new Image();
    
    image.filename = data.filename;
    image.originalName = data.originalName;
    image.mimetype = data.mimetype;
    image.size = data.size;
    image.url = data.url;
    image.thumbnailUrl = data.thumbnailUrl;
    image.uploadedBy = data.uploadedBy;
    image.width = data.width;
    image.height = data.height;
    image.format = data.format;
    image.caption = data.caption;
    image.altText = data.altText;
    image.displayOrder = data.displayOrder || 0;
    image.entityType = data.entityType;
    image.entityId = data.entityId;

    return image;
  }

  /**
   * Update image metadata
   */
  updateMetadata(data: {
    caption?: string;
    altText?: string;
    displayOrder?: number;
  }): void {
    if (data.caption !== undefined) {
      this.caption = data.caption;
    }
    if (data.altText !== undefined) {
      this.altText = data.altText;
    }
    if (data.displayOrder !== undefined) {
      this.displayOrder = data.displayOrder;
    }
  }

  /**
   * Associate image with an entity
   */
  associateWith(entityType: string, entityId: number): void {
    this.entityType = entityType;
    this.entityId = entityId;
  }

  /**
   * Remove association with entity
   */
  removeAssociation(): void {
    this.entityType = undefined;
    this.entityId = undefined;
  }
}
