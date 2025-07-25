import { Request, Response } from 'express';
import { RatingService } from '../services/rating.service';
import { CreateRatingDto, UpdateRatingDto, RatingSearchDto } from '../types/rating.dto';
import { AuthenticatedRequest } from '../types/auth.dto';
import { ResponseUtil } from '../utils/response.util';

/**
 * Controller for managing ratings
 */
export class RatingController {
  private ratingService: RatingService;

  constructor() {
    this.ratingService = new RatingService();
  }

  /**
   * Create a new rating
   */
  createRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const createRatingDto: CreateRatingDto = req.body;

      const rating = await this.ratingService.createRating(userId, createRatingDto);

      ResponseUtil.success(res, {
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        listingId: rating.listingId,
        createdAt: rating.createdAt,
      }, 'Rating created successfully', 201);
    } catch (error) {
      console.error('❌ Error creating rating:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Update an existing rating
   */
  updateRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const ratingId = parseInt(req.params.id);
      const updateRatingDto: UpdateRatingDto = req.body;

      if (isNaN(ratingId)) {
        ResponseUtil.error(res, 'Invalid rating ID', 400);
        return;
      }

      const rating = await this.ratingService.updateRating(userId, ratingId, updateRatingDto);

      ResponseUtil.success(res, {
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        updatedAt: rating.updatedAt,
      }, 'Rating updated successfully');
    } catch (error) {
      console.error('❌ Error updating rating:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Delete a rating
   */
  deleteRating = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const ratingId = parseInt(req.params.id);

      if (isNaN(ratingId)) {
        ResponseUtil.error(res, 'Invalid rating ID', 400);
        return;
      }

      await this.ratingService.deleteRating(userId, ratingId);

      ResponseUtil.success(res, null, 'Rating deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting rating:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get ratings for a specific listing
   */
  getListingRatings = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.listingId);

      if (isNaN(listingId)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      const searchDto: RatingSearchDto = {
        minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await this.ratingService.getListingRatings(listingId, searchDto);

      ResponseUtil.success(res, result.data, 'Listing ratings retrieved successfully', 200, {
        ...result.meta,
        stats: result.stats,
      });
    } catch (error) {
      console.error('❌ Error getting listing ratings:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get rating statistics for a listing
   */
  getListingRatingStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.listingId);

      if (isNaN(listingId)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      const stats = await this.ratingService.getListingRatingStats(listingId);

      ResponseUtil.success(res, stats, 'Rating statistics retrieved successfully');
    } catch (error) {
      console.error('❌ Error getting rating statistics:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get current user's ratings
   */
  getUserRatings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      const searchDto: RatingSearchDto = {
        minRating: req.query.minRating ? parseInt(req.query.minRating as string) : undefined,
        maxRating: req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as any || 'DESC',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await this.ratingService.getUserRatings(userId, searchDto);

      ResponseUtil.success(res, result.data, 'User ratings retrieved successfully', 200, result.meta);
    } catch (error) {
      console.error('❌ Error getting user ratings:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Get a specific rating by ID
   */
  getRatingById = async (req: Request, res: Response): Promise<void> => {
    try {
      const ratingId = parseInt(req.params.id);

      if (isNaN(ratingId)) {
        ResponseUtil.error(res, 'Invalid rating ID', 400);
        return;
      }

      const rating = await this.ratingService.getRatingById(ratingId);

      if (!rating) {
        ResponseUtil.notFound(res, 'Rating not found');
        return;
      }

      ResponseUtil.success(res, {
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        user: rating.user ? {
          id: rating.user.id,
          firstName: rating.user.firstName,
          lastName: rating.user.lastName,
          fullName: rating.user.fullName,
        } : null,
        listing: rating.listing ? {
          id: rating.listing.id,
          title: rating.listing.title,
        } : null,
      }, 'Rating retrieved successfully');
    } catch (error) {
      console.error('❌ Error getting rating:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };

  /**
   * Check if user can rate a listing
   */
  canUserRateListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const listingId = parseInt(req.params.listingId);

      if (isNaN(listingId)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      const canRate = await this.ratingService.canUserRateListing(userId, listingId);

      ResponseUtil.success(res, {
        canRate,
        listingId,
      }, 'Rating eligibility checked successfully');
    } catch (error) {
      console.error('❌ Error checking rating eligibility:', error);
      ResponseUtil.error(res, (error as Error).message, 400);
    }
  };
}