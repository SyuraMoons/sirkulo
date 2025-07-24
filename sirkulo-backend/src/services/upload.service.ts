import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Image } from '../models/image.model';
import { ImageProcessor } from '../utils/image-processor.util';
import { getImageUrl } from '../config/upload';
import { ImageResponseDto, MultipleImageResponseDto } from '../types/upload.dto';

/**
 * Upload service for handling file uploads and image management
 */
export class UploadService {
  private imageRepository: Repository<Image>;

  constructor() {
    this.imageRepository = AppDataSource.getRepository(Image);
  }

  /**
   * Process and save single uploaded image
   */
  async processSingleImage(
    file: Express.Multer.File,
    uploadedBy: number,
    metadata?: {
      caption?: string;
      altText?: string;
      displayOrder?: number;
      entityType?: string;
      entityId?: number;
    }
  ): Promise<ImageResponseDto> {
    try {
      // Validate image
      const validation = await ImageProcessor.validateImage(file.path);
      if (!validation.isValid) {
        await ImageProcessor.deleteImage(file.filename);
        throw new Error(validation.error || 'Invalid image file');
      }

      // Process image (create thumbnail, optimize)
      const processed = await ImageProcessor.processImage(file.filename);

      // Create image record
      const image = Image.create({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: getImageUrl(file.filename, 'original'),
        thumbnailUrl: getImageUrl(file.filename, 'thumbnail'),
        uploadedBy,
        width: processed.metadata.width,
        height: processed.metadata.height,
        format: processed.metadata.format,
        caption: metadata?.caption,
        altText: metadata?.altText,
        displayOrder: metadata?.displayOrder,
        entityType: metadata?.entityType,
        entityId: metadata?.entityId
      });

      // Set listing relationship if entityType is 'listing'
      if (metadata?.entityType === 'listing' && metadata?.entityId) {
        image.listingId = metadata.entityId;
      }

      const savedImage = await this.imageRepository.save(image);

      return this.toResponseDto(savedImage);
    } catch (error) {
      // Clean up file if processing fails
      await ImageProcessor.deleteImage(file.filename);
      throw error;
    }
  }

  /**
   * Process and save multiple uploaded images
   */
  async processMultipleImages(
    files: Express.Multer.File[],
    uploadedBy: number,
    metadata?: {
      captions?: string[];
      altTexts?: string[];
      displayOrders?: number[];
      entityType?: string;
      entityId?: number;
    }
  ): Promise<MultipleImageResponseDto> {
    const results: ImageResponseDto[] = [];
    const errors: string[] = [];
    let uploaded = 0;
    let failed = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const imageMetadata = {
          caption: metadata?.captions?.[i],
          altText: metadata?.altTexts?.[i],
          displayOrder: metadata?.displayOrders?.[i] ?? i,
          entityType: metadata?.entityType,
          entityId: metadata?.entityId
        };

        const result = await this.processSingleImage(file, uploadedBy, imageMetadata);
        results.push(result);
        uploaded++;
      } catch (error) {
        failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${file.originalname}: ${errorMessage}`);
      }
    }

    return {
      images: results,
      uploaded,
      failed,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Get image by ID
   */
  async getImageById(id: number): Promise<Image | null> {
    return await this.imageRepository.findOne({
      where: { id },
      relations: ['uploader']
    });
  }

  /**
   * Get images by entity
   */
  async getImagesByEntity(entityType: string, entityId: number): Promise<Image[]> {
    return await this.imageRepository.find({
      where: { entityType, entityId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
      relations: ['uploader']
    });
  }

  /**
   * Get images uploaded by user
   */
  async getImagesByUser(userId: number, limit: number = 50, offset: number = 0): Promise<{
    images: Image[];
    total: number;
  }> {
    const [images, total] = await this.imageRepository.findAndCount({
      where: { uploadedBy: userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
      relations: ['uploader']
    });

    return { images, total };
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    imageId: number,
    userId: number,
    metadata: {
      caption?: string;
      altText?: string;
      displayOrder?: number;
    }
  ): Promise<Image> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, uploadedBy: userId }
    });

    if (!image) {
      throw new Error('Image not found or access denied');
    }

    image.updateMetadata(metadata);
    return await this.imageRepository.save(image);
  }

  /**
   * Associate image with entity
   */
  async associateImageWithEntity(
    imageId: number,
    userId: number,
    entityType: string,
    entityId: number
  ): Promise<Image> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, uploadedBy: userId }
    });

    if (!image) {
      throw new Error('Image not found or access denied');
    }

    image.associateWith(entityType, entityId);
    return await this.imageRepository.save(image);
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: number, userId: number): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId, uploadedBy: userId }
    });

    if (!image) {
      throw new Error('Image not found or access denied');
    }

    // Delete physical files
    await ImageProcessor.deleteImage(image.filename);

    // Delete database record
    await this.imageRepository.remove(image);
  }

  /**
   * Delete images associated with entity
   */
  async deleteImagesByEntity(entityType: string, entityId: number): Promise<void> {
    const images = await this.imageRepository.find({
      where: { entityType, entityId }
    });

    for (const image of images) {
      await ImageProcessor.deleteImage(image.filename);
    }

    await this.imageRepository.remove(images);
  }

  /**
   * Get orphaned images (not associated with any entity)
   */
  async getOrphanedImages(olderThanDays: number = 7): Promise<Image[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    return await this.imageRepository.createQueryBuilder('image')
      .where('image.entityType IS NULL')
      .andWhere('image.entityId IS NULL')
      .andWhere('image.createdAt < :cutoffDate', { cutoffDate })
      .getMany();
  }

  /**
   * Upload images for a specific listing
   */
  async uploadListingImages(
    files: Express.Multer.File[],
    listingId: number,
    uploadedBy: number,
    metadata?: {
      captions?: string[];
      altTexts?: string[];
    }
  ): Promise<MultipleImageResponseDto> {
    const displayOrders = files.map((_, index) => index);
    
    return this.processMultipleImages(files, uploadedBy, {
      captions: metadata?.captions,
      altTexts: metadata?.altTexts,
      displayOrders,
      entityType: 'listing',
      entityId: listingId
    });
  }

  /**
   * Get images for a specific listing
   */
  async getListingImages(listingId: number): Promise<ImageResponseDto[]> {
    const images = await this.imageRepository.find({
      where: { 
        listingId,
        entityType: 'listing'
      },
      order: { displayOrder: 'ASC', createdAt: 'ASC' }
    });

    return images.map(image => this.toResponseDto(image));
  }

  /**
   * Update listing image order
   */
  async updateListingImageOrder(
    listingId: number,
    imageOrders: { imageId: number; displayOrder: number }[]
  ): Promise<void> {
    for (const order of imageOrders) {
      await this.imageRepository.update(
        { 
          id: order.imageId,
          listingId,
          entityType: 'listing'
        },
        { displayOrder: order.displayOrder }
      );
    }
  }

  /**
   * Delete a listing image
   */
  async deleteListingImage(listingId: number, imageId: number): Promise<boolean> {
    const image = await this.imageRepository.findOne({
      where: { 
        id: imageId,
        listingId,
        entityType: 'listing'
      }
    });

    if (!image) {
      return false;
    }

    // Delete physical files
    await ImageProcessor.deleteImage(image.filename);

    // Delete database record
    await this.imageRepository.remove(image);

    return true;
  }

  /**
   * Clean up orphaned images
   */
  async cleanupOrphanedImages(olderThanDays: number = 7): Promise<number> {
    const orphanedImages = await this.getOrphanedImages(olderThanDays);
    
    for (const image of orphanedImages) {
      await ImageProcessor.deleteImage(image.filename);
    }

    await this.imageRepository.remove(orphanedImages);
    return orphanedImages.length;
  }

  /**
   * Convert Image entity to response DTO
   */
  private toResponseDto(image: Image): ImageResponseDto {
    return {
      id: image.id.toString(),
      filename: image.filename,
      originalName: image.originalName,
      mimetype: image.mimetype,
      size: image.size,
      url: image.url,
      thumbnailUrl: image.thumbnailUrl,
      caption: image.caption,
      altText: image.altText,
      displayOrder: image.displayOrder,
      metadata: {
        width: image.width,
        height: image.height,
        format: image.format
      },
      uploadedAt: image.createdAt
    };
  }
}
