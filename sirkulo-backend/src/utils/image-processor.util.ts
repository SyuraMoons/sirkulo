import sharp from 'sharp';
import fs from 'fs/promises';
import { IMAGE_DIMENSIONS, getImagePath } from '../config/upload';

/**
 * Image processing utilities for Sirkulo marketplace
 */
export class ImageProcessor {
  /**
   * Process uploaded image: resize, optimize, and create thumbnail
   */
  static async processImage(filename: string): Promise<{
    original: string;
    thumbnail: string;
    metadata: sharp.Metadata;
  }> {
    const originalPath = getImagePath(filename, 'original');
    const thumbnailPath = getImagePath(filename, 'thumbnail');

    try {
      // Get image metadata
      const metadata = await sharp(originalPath).metadata();

      // Create optimized original image
      await sharp(originalPath)
        .resize(IMAGE_DIMENSIONS.large.width, IMAGE_DIMENSIONS.large.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(originalPath + '.optimized');

      // Replace original with optimized version
      await fs.rename(originalPath + '.optimized', originalPath);

      // Create thumbnail
      await sharp(originalPath)
        .resize(IMAGE_DIMENSIONS.thumbnail.width, IMAGE_DIMENSIONS.thumbnail.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toFile(thumbnailPath);

      return {
        original: filename,
        thumbnail: filename,
        metadata
      };
    } catch (error) {
      // Clean up files if processing fails
      await this.cleanupFile(originalPath);
      await this.cleanupFile(thumbnailPath);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create multiple sizes for an image
   */
  static async createImageSizes(filename: string): Promise<{
    original: string;
    medium: string;
    thumbnail: string;
  }> {
    const originalPath = getImagePath(filename, 'original');
    const mediumFilename = `medium_${filename}`;
    const thumbnailFilename = `thumb_${filename}`;
    
    const mediumPath = getImagePath(mediumFilename, 'original');
    const thumbnailPath = getImagePath(thumbnailFilename, 'thumbnail');

    try {
      // Create medium size
      await sharp(originalPath)
        .resize(IMAGE_DIMENSIONS.medium.width, IMAGE_DIMENSIONS.medium.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(mediumPath);

      // Create thumbnail
      await sharp(originalPath)
        .resize(IMAGE_DIMENSIONS.thumbnail.width, IMAGE_DIMENSIONS.thumbnail.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      return {
        original: filename,
        medium: mediumFilename,
        thumbnail: thumbnailFilename
      };
    } catch (error) {
      // Clean up created files on error
      await this.cleanupFile(mediumPath);
      await this.cleanupFile(thumbnailPath);
      throw new Error(`Image size creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete image and its variants
   */
  static async deleteImage(filename: string): Promise<void> {
    const originalPath = getImagePath(filename, 'original');
    const thumbnailPath = getImagePath(filename, 'thumbnail');
    const mediumPath = getImagePath(`medium_${filename}`, 'original');

    await Promise.allSettled([
      this.cleanupFile(originalPath),
      this.cleanupFile(thumbnailPath),
      this.cleanupFile(mediumPath)
    ]);
  }

  /**
   * Validate image file before processing
   */
  static async validateImage(filePath: string): Promise<{
    isValid: boolean;
    error?: string;
    metadata?: sharp.Metadata;
  }> {
    try {
      const metadata = await sharp(filePath).metadata();
      
      // Check if it's a valid image
      if (!metadata.format) {
        return {
          isValid: false,
          error: 'Invalid image format'
        };
      }

      // Check minimum dimensions
      if (metadata.width && metadata.height) {
        if (metadata.width < 100 || metadata.height < 100) {
          return {
            isValid: false,
            error: 'Image dimensions too small (minimum 100x100px)'
          };
        }
      }

      return {
        isValid: true,
        metadata
      };
    } catch (error) {
      return {
        isValid: false,
        error: `Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get image information
   */
  static async getImageInfo(filename: string): Promise<{
    exists: boolean;
    metadata?: sharp.Metadata;
    sizes?: {
      original: number;
      thumbnail: number;
    };
  }> {
    try {
      const originalPath = getImagePath(filename, 'original');
      const thumbnailPath = getImagePath(filename, 'thumbnail');

      // Check if files exist
      const [originalExists, thumbnailExists] = await Promise.all([
        this.fileExists(originalPath),
        this.fileExists(thumbnailPath)
      ]);

      if (!originalExists) {
        return { exists: false };
      }

      // Get metadata and file sizes
      const [metadata, originalStats, thumbnailStats] = await Promise.all([
        sharp(originalPath).metadata(),
        fs.stat(originalPath),
        thumbnailExists ? fs.stat(thumbnailPath) : null
      ]);

      return {
        exists: true,
        metadata,
        sizes: {
          original: originalStats.size,
          thumbnail: thumbnailStats?.size || 0
        }
      };
    } catch (error) {
      return { exists: false };
    }
  }

  /**
   * Utility function to check if file exists
   */
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility function to safely delete file
   */
  private static async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // File might not exist, ignore error
    }
  }
}
