import { Response } from 'express';
import path from 'path';
import { UploadService } from '../services/upload.service';
import { ResponseUtil } from '../utils/response.util';
import { ImageUploadDto, MultipleImageUploadDto, ImageMetadataDto } from '../types/upload.dto';
import { validateImageFile } from '../config/upload';
import { AuthenticatedRequest } from '../types/auth.dto';

/**
 * Upload controller for handling file uploads
 */
export class UploadController {
  private uploadService: UploadService;

  constructor() {
    this.uploadService = new UploadService();
  }

  /**
   * Upload single image
   * POST /api/uploads/image
   */
  uploadSingleImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const file = req.file;
      if (!file) {
        ResponseUtil.error(res, 'No file uploaded', 400);
        return;
      }

      // Validate file
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        ResponseUtil.error(res, validation.error || 'Invalid file', 400);
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const metadata: ImageUploadDto = req.body;
      
      const result = await this.uploadService.processSingleImage(file, userId, metadata);

      ResponseUtil.success(
        res,
        result,
        'Image uploaded successfully',
        201
      );
    } catch (error) {
      console.error('Error uploading image:', error);
      ResponseUtil.error(res, 'Failed to upload image', 500);
    }
  };

  /**
   * Upload multiple images
   * POST /api/uploads/images
   */
  uploadMultipleImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        ResponseUtil.error(res, 'No files uploaded', 400);
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      // Validate all files
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.isValid) {
          ResponseUtil.error(res, `${file.originalname}: ${validation.error}`, 400);
          return;
        }
      }

      const metadata: MultipleImageUploadDto = req.body;
      
      const result = await this.uploadService.processMultipleImages(files, userId, metadata);

      ResponseUtil.success(
        res,
        result,
        `Successfully uploaded ${result.uploaded} images${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
        201
      );
    } catch (error) {
      console.error('Error uploading images:', error);
      ResponseUtil.error(res, 'Failed to upload images', 500);
    }
  };

  /**
   * Get image file
   * GET /api/uploads/image/:filename
   */
  getImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);

      res.sendFile(imagePath, (err) => {
        if (err) {
          ResponseUtil.error(res, 'Image not found', 404);
        }
      });
    } catch (error) {
      console.error('Error serving image:', error);
      ResponseUtil.error(res, 'Failed to serve image', 500);
    }
  };

  /**
   * Get thumbnail image
   * GET /api/uploads/thumbnail/:filename
   */
  getThumbnail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', filename);

      res.sendFile(thumbnailPath, (err) => {
        if (err) {
          // Fallback to original image if thumbnail doesn't exist
          const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);
          res.sendFile(imagePath, (fallbackErr) => {
            if (fallbackErr) {
              ResponseUtil.error(res, 'Image not found', 404);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error serving thumbnail:', error);
      ResponseUtil.error(res, 'Failed to serve thumbnail', 500);
    }
  };

  /**
   * Get image metadata
   * GET /api/uploads/image/:id/metadata
   */
  getImageMetadata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        ResponseUtil.error(res, 'Invalid image ID', 400);
        return;
      }

      const image = await this.uploadService.getImageById(imageId);
      if (!image) {
        ResponseUtil.error(res, 'Image not found', 404);
        return;
      }

      ResponseUtil.success(res, {
        id: image.id,
        filename: image.filename,
        originalName: image.originalName,
        size: image.getFormattedSize(),
        dimensions: image.getDimensions(),
        format: image.format,
        caption: image.caption,
        altText: image.altText,
        displayOrder: image.displayOrder,
        uploadedAt: image.createdAt,
        isAssociated: image.isAssociated()
      });
    } catch (error) {
      console.error('Error getting image metadata:', error);
      ResponseUtil.error(res, 'Failed to get image metadata', 500);
    }
  };

  /**
   * Update image metadata
   * PUT /api/uploads/image/:id/metadata
   */
  updateImageMetadata = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        ResponseUtil.error(res, 'Invalid image ID', 400);
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const metadata: ImageMetadataDto = req.body;
      
      const updatedImage = await this.uploadService.updateImageMetadata(imageId, userId, metadata);

      ResponseUtil.success(res, {
        id: updatedImage.id,
        caption: updatedImage.caption,
        altText: updatedImage.altText,
        displayOrder: updatedImage.displayOrder,
        updatedAt: updatedImage.updatedAt
      }, 'Image metadata updated successfully');
    } catch (error) {
      console.error('Error updating image metadata:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        ResponseUtil.error(res, error.message, 404);
      } else {
        ResponseUtil.error(res, 'Failed to update image metadata', 500);
      }
    }
  };

  /**
   * Delete image
   * DELETE /api/uploads/image/:id
   */
  deleteImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        ResponseUtil.error(res, 'Invalid image ID', 400);
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      await this.uploadService.deleteImage(imageId, userId);

      ResponseUtil.success(res, null, 'Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        ResponseUtil.error(res, error.message, 404);
      } else {
        ResponseUtil.error(res, 'Failed to delete image', 500);
      }
    }
  };

  /**
   * Get user's uploaded images
   * GET /api/uploads/my-images
   */
  getUserImages = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await this.uploadService.getImagesByUser(userId, limit, offset);

      ResponseUtil.success(res, {
        images: result.images.map(image => ({
          id: image.id,
          filename: image.filename,
          originalName: image.originalName,
          url: image.url,
          thumbnailUrl: image.thumbnailUrl,
          caption: image.caption,
          altText: image.altText,
          size: image.getFormattedSize(),
          dimensions: image.getDimensions(),
          uploadedAt: image.createdAt,
          isAssociated: image.isAssociated(),
          entityType: image.entityType,
          entityId: image.entityId
        })),
        pagination: {
          total: result.total,
          limit,
          offset,
          hasMore: offset + limit < result.total
        }
      });
    } catch (error) {
      console.error('Error getting user images:', error);
      ResponseUtil.error(res, 'Failed to get user images', 500);
    }
  };

  /**
   * Associate image with entity
   * POST /api/uploads/image/:id/associate
   */
  associateImage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const imageId = parseInt(req.params.id);
      if (isNaN(imageId)) {
        ResponseUtil.error(res, 'Invalid image ID', 400);
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        ResponseUtil.error(res, 'User not authenticated', 401);
        return;
      }

      const { entityType, entityId } = req.body;
      if (!entityType || !entityId) {
        ResponseUtil.error(res, 'Entity type and ID are required', 400);
        return;
      }

      const updatedImage = await this.uploadService.associateImageWithEntity(
        imageId,
        userId,
        entityType,
        parseInt(entityId)
      );

      ResponseUtil.success(res, {
        id: updatedImage.id,
        entityType: updatedImage.entityType,
        entityId: updatedImage.entityId,
        updatedAt: updatedImage.updatedAt
      }, 'Image associated successfully');
    } catch (error) {
      console.error('Error associating image:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        ResponseUtil.error(res, error.message, 404);
      } else {
        ResponseUtil.error(res, 'Failed to associate image', 500);
      }
    }
  };
}
