import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Rating } from '../models/rating.model';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { 
  CreateRatingDto, 
  UpdateRatingDto, 
  RatingSearchDto,
  ListingRatingStatsDto,
  PaginatedRatingsResponseDto 
} from '../types/rating.dto';

/**
 * Service for managing ratings
 */
export class RatingService {
  private ratingRepository: Repository<Rating>;
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  constructor() {
    this.ratingRepository = AppDataSource.getRepository(Rating);
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new rating and update listing aggregates
   */
  async createRating(userId: number, createRatingDto: CreateRatingDto): Promise<Rating> {
    const { listingId, rating, comment } = createRatingDto;

    // Validate rating value
    if (!Rating.isValidRating(rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if listing exists
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, isActive: true },
      relations: ['business']
    });

    if (!listing) {
      throw new Error('Listing not found or inactive');
    }

    // Prevent self-rating
    if (listing.businessId === userId) {
      throw new Error('Cannot rate your own listing');
    }

    // Check if user already rated this listing
    const existingRating = await this.ratingRepository.findOne({
      where: { userId, listingId, isActive: true }
    });

    if (existingRating) {
      throw new Error('You have already rated this listing');
    }

    // Create new rating
    const newRating = this.ratingRepository.create({
      userId,
      listingId,
      rating,
      comment: comment || null,
    });

    const savedRating = await this.ratingRepository.save(newRating);

    // Update listing rating aggregates
    await this.updateListingRatingAggregates(listingId);

    // Return rating with relations
    return this.ratingRepository.findOne({
      where: { id: savedRating.id },
      relations: ['user', 'listing']
    }) as Promise<Rating>;
  }

  /**
   * Update an existing rating and update listing aggregates
   */
  async updateRating(userId: number, ratingId: number, updateRatingDto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId, userId, isActive: true },
      relations: ['user', 'listing']
    });

    if (!rating) {
      throw new Error('Rating not found or you do not have permission to update it');
    }

    // Validate new rating value if provided
    if (updateRatingDto.rating && !Rating.isValidRating(updateRatingDto.rating)) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Update rating
    Object.assign(rating, updateRatingDto);
    const updatedRating = await this.ratingRepository.save(rating);

    // Update listing rating aggregates
    await this.updateListingRatingAggregates(rating.listingId);

    return updatedRating;
  }

  /**
   * Delete a rating (soft delete by setting isActive to false) and update listing aggregates
   */
  async deleteRating(userId: number, ratingId: number): Promise<void> {
    const rating = await this.ratingRepository.findOne({
      where: { id: ratingId, userId, isActive: true }
    });

    if (!rating) {
      throw new Error('Rating not found or you do not have permission to delete it');
    }

    const listingId = rating.listingId;
    rating.isActive = false;
    await this.ratingRepository.save(rating);

    // Update listing rating aggregates
    await this.updateListingRatingAggregates(listingId);
  }

  /**
   * Get ratings for a listing with pagination
   */
  async getListingRatings(listingId: number, searchDto: RatingSearchDto): Promise<PaginatedRatingsResponseDto> {
    const {
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = searchDto;

    const queryBuilder = this.ratingRepository.createQueryBuilder('rating')
      .leftJoinAndSelect('rating.user', 'user')
      .where('rating.listingId = :listingId', { listingId })
      .andWhere('rating.isActive = :isActive', { isActive: true });

    // Apply filters
    if (minRating) {
      queryBuilder.andWhere('rating.rating >= :minRating', { minRating });
    }

    if (maxRating) {
      queryBuilder.andWhere('rating.rating <= :maxRating', { maxRating });
    }

    // Apply sorting
    queryBuilder.orderBy(`rating.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [ratings, total] = await queryBuilder.getManyAndCount();

    // Get rating statistics
    const stats = await this.getListingRatingStats(listingId);

    return {
      data: ratings.map(rating => rating.toSummary()),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      stats,
    };
  }

  /**
   * Get rating statistics for a listing
   */
  async getListingRatingStats(listingId: number): Promise<ListingRatingStatsDto> {
    const stats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select([
        'COUNT(*) as total_ratings',
        'AVG(rating.rating) as average_rating',
        'SUM(CASE WHEN rating.rating = 1 THEN 1 ELSE 0 END) as rating_1',
        'SUM(CASE WHEN rating.rating = 2 THEN 1 ELSE 0 END) as rating_2',
        'SUM(CASE WHEN rating.rating = 3 THEN 1 ELSE 0 END) as rating_3',
        'SUM(CASE WHEN rating.rating = 4 THEN 1 ELSE 0 END) as rating_4',
        'SUM(CASE WHEN rating.rating = 5 THEN 1 ELSE 0 END) as rating_5',
      ])
      .where('rating.listingId = :listingId', { listingId })
      .andWhere('rating.isActive = :isActive', { isActive: true })
      .getRawOne();

    return {
      listingId,
      totalRatings: parseInt(stats.total_ratings) || 0,
      averageRating: parseFloat(stats.average_rating) || 0,
      ratingDistribution: {
        1: parseInt(stats.rating_1) || 0,
        2: parseInt(stats.rating_2) || 0,
        3: parseInt(stats.rating_3) || 0,
        4: parseInt(stats.rating_4) || 0,
        5: parseInt(stats.rating_5) || 0,
      },
    };
  }

  /**
   * Get user's ratings with pagination
   */
  async getUserRatings(userId: number, searchDto: RatingSearchDto): Promise<PaginatedRatingsResponseDto> {
    const {
      minRating,
      maxRating,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 10
    } = searchDto;

    const queryBuilder = this.ratingRepository.createQueryBuilder('rating')
      .leftJoinAndSelect('rating.listing', 'listing')
      .where('rating.userId = :userId', { userId })
      .andWhere('rating.isActive = :isActive', { isActive: true });

    // Apply filters
    if (minRating) {
      queryBuilder.andWhere('rating.rating >= :minRating', { minRating });
    }

    if (maxRating) {
      queryBuilder.andWhere('rating.rating <= :maxRating', { maxRating });
    }

    // Apply sorting
    queryBuilder.orderBy(`rating.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [ratings, total] = await queryBuilder.getManyAndCount();

    return {
      data: ratings.map(rating => ({
        ...rating.toSummary(),
        listing: rating.listing ? {
          id: rating.listing.id,
          title: rating.listing.title,
        } : null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get a specific rating by ID
   */
  async getRatingById(ratingId: number): Promise<Rating | null> {
    return this.ratingRepository.findOne({
      where: { id: ratingId, isActive: true },
      relations: ['user', 'listing']
    });
  }

  /**
   * Check if user can rate a listing
   */
  async canUserRateListing(userId: number, listingId: number): Promise<boolean> {
    // Check if listing exists and is not owned by user
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, isActive: true }
    });

    if (!listing || listing.businessId === userId) {
      return false;
    }

    // Check if user already rated this listing
    const existingRating = await this.ratingRepository.findOne({
      where: { userId, listingId, isActive: true }
    });

    return !existingRating;
  }

  /**
   * Get average rating for multiple listings (for listing summaries)
   */
  async getListingsAverageRatings(listingIds: number[]): Promise<Map<number, { average: number; total: number }>> {
    if (listingIds.length === 0) {
      return new Map();
    }

    const stats = await this.ratingRepository
      .createQueryBuilder('rating')
      .select([
        'rating.listingId as listing_id',
        'AVG(rating.rating) as average_rating',
        'COUNT(*) as total_ratings'
      ])
      .where('rating.listingId IN (:...listingIds)', { listingIds })
      .andWhere('rating.isActive = :isActive', { isActive: true })
      .groupBy('rating.listingId')
      .getRawMany();

    const ratingsMap = new Map();
    stats.forEach(stat => {
      ratingsMap.set(parseInt(stat.listing_id), {
        average: parseFloat(stat.average_rating) || 0,
        total: parseInt(stat.total_ratings) || 0,
      });
    });

    return ratingsMap;
  }

  /**
   * Update listing rating aggregates after rating changes
   */
  private async updateListingRatingAggregates(listingId: number): Promise<void> {
    const stats = await this.getListingRatingStats(listingId);
    
    const listing = await this.listingRepository.findOne({
      where: { id: listingId }
    });

    if (listing) {
      listing.updateRatingAggregates(stats.averageRating, stats.totalRatings);
      await this.listingRepository.save(listing);
    }
  }
}