import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { 
  CreateCraftsListingDto, 
  UpdateCraftsListingDto, 
  CraftsListingFiltersDto 
} from '../dto/listing-extended.dto';
import { ListingCategory, UserRole, ListingStatus } from '../types';

/**
 * Controller for Crafts Listings
 * Handles upcycled/recycled crafts and art that can be purchased
 */
export class CraftsListingController {
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  constructor() {
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new crafts listing
   * Both businesses and recyclers can create crafts listings
   */
  public createCraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user.userId;
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check if user is a business or recycler
      if (!user.roles.includes(UserRole.BUSINESS) && !user.roles.includes(UserRole.RECYCLER)) {
        res.status(403).json({
          success: false,
          message: 'Only businesses and recyclers can create crafts listings',
        });
        return;
      }

      // Validate DTO
      const createCraftsDto = plainToClass(CreateCraftsListingDto, req.body);
      const errors = await validate(createCraftsDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(error => ({
            field: error.property,
            message: Object.values(error.constraints || {}).join(', '),
          })),
        });
        return;
      }

      // Create crafts listing
      const craftsListing = this.listingRepository.create({
        ...createCraftsDto,
        category: ListingCategory.CRAFTS,
        businessId: userId,
        totalPrice: createCraftsDto.pricePerUnit * createCraftsDto.quantity,
      });

      // Validate crafts-specific fields
      const validationErrors = craftsListing.validateListingType();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Crafts validation failed',
          errors: validationErrors,
        });
        return;
      }

      const savedListing = await this.listingRepository.save(craftsListing);

      // Load the complete listing with business details
      const completeListing = await this.listingRepository.findOne({
        where: { id: savedListing.id },
        relations: ['business'],
      });

      res.status(201).json({
        success: true,
        message: 'Crafts listing created successfully',
        data: {
          listing: {
            ...completeListing?.toSummary(),
            isAvailableForPurchase: completeListing?.isCraftAvailableForPurchase(),
          },
        },
      });
    } catch (error) {
      console.error('Error creating crafts listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get all crafts listings with filters
   */
  public getCrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      // Validate filters
      const filtersDto = plainToClass(CraftsListingFiltersDto, req.query);
      const errors = await validate(filtersDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid filter parameters',
          errors: errors.map(error => ({
            field: error.property,
            message: Object.values(error.constraints || {}).join(', '),
          })),
        });
        return;
      }

      // Build query
      const queryBuilder = this.listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.business', 'business')
        .where('listing.category = :category', { category: ListingCategory.CRAFTS })
        .andWhere('listing.isActive = :isActive', { isActive: true })
        .andWhere('listing.status = :status', { status: ListingStatus.ACTIVE });

      // Apply filters
      if (filtersDto.material) {
        queryBuilder.andWhere('listing.craftMaterial = :material', { 
          material: filtersDto.material 
        });
      }

      if (filtersDto.category) {
        queryBuilder.andWhere('listing.craftCategory = :craftCategory', { 
          craftCategory: filtersDto.category 
        });
      }

      if (filtersDto.minPrice !== undefined) {
        queryBuilder.andWhere('listing.pricePerUnit >= :minPrice', { 
          minPrice: filtersDto.minPrice 
        });
      }

      if (filtersDto.maxPrice !== undefined) {
        queryBuilder.andWhere('listing.pricePerUnit <= :maxPrice', { 
          maxPrice: filtersDto.maxPrice 
        });
      }

      if (filtersDto.isCustomizable !== undefined) {
        queryBuilder.andWhere('listing.isCustomizable = :isCustomizable', { 
          isCustomizable: filtersDto.isCustomizable 
        });
      }

      if (filtersDto.artistName) {
        queryBuilder.andWhere('listing.artistName ILIKE :artistName', { 
          artistName: `%${filtersDto.artistName}%` 
        });
      }

      if (filtersDto.maxCraftingTime) {
        queryBuilder.andWhere('listing.estimatedCraftingTime <= :maxCraftingTime', { 
          maxCraftingTime: filtersDto.maxCraftingTime 
        });
      }

      // Apply sorting
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      if (sortBy === 'price') {
        queryBuilder.orderBy('listing.pricePerUnit', sortOrder);
      } else if (sortBy === 'rating') {
        queryBuilder.orderBy('listing.averageRating', sortOrder);
      } else if (sortBy === 'craftingTime') {
        queryBuilder.orderBy('listing.estimatedCraftingTime', sortOrder);
      } else {
        queryBuilder.orderBy(`listing.${sortBy}`, sortOrder);
      }

      // Get total count
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      const listings = await queryBuilder
        .skip(skip)
        .take(limit)
        .getMany();

      const craftsListings = listings.map(listing => ({
        ...listing.toSummary(),
        isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
      }));

      res.status(200).json({
        success: true,
        message: 'Crafts listings retrieved successfully',
        data: {
          listings: craftsListings,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting crafts listings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get a specific crafts listing
   */
  public getCraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.CRAFTS,
          isActive: true 
        },
        relations: ['business', 'imageEntities', 'ratings'],
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Crafts listing not found',
        });
        return;
      }

      // Increment view count
      listing.incrementViewCount();
      await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Crafts listing retrieved successfully',
        data: {
          listing: {
            ...listing.toSummary(),
            isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
            targetAudience: listing.getTargetAudience(),
            fullDescription: listing.description,
            careInstructions: listing.careInstructions,
            artistBio: listing.artistBio,
            specifications: listing.specifications,
          },
        },
      });
    } catch (error) {
      console.error('Error getting crafts listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update a crafts listing
   */
  public updateCraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.CRAFTS,
          businessId: userId 
        },
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Crafts listing not found or access denied',
        });
        return;
      }

      // Validate DTO
      const updateCraftsDto = plainToClass(UpdateCraftsListingDto, req.body);
      const errors = await validate(updateCraftsDto);

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.map(error => ({
            field: error.property,
            message: Object.values(error.constraints || {}).join(', '),
          })),
        });
        return;
      }

      // Update listing
      Object.assign(listing, updateCraftsDto);

      // Recalculate total price if price or quantity changed
      if (updateCraftsDto.pricePerUnit || listing.quantity) {
        listing.totalPrice = (listing.pricePerUnit || 0) * listing.quantity;
      }

      // Validate updated listing
      const validationErrors = listing.validateListingType();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Crafts validation failed',
          errors: validationErrors,
        });
        return;
      }

      const savedListing = await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Crafts listing updated successfully',
        data: {
          listing: {
            ...savedListing.toSummary(),
            isAvailableForPurchase: savedListing.isCraftAvailableForPurchase(),
          },
        },
      });
    } catch (error) {
      console.error('Error updating crafts listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Delete a crafts listing
   */
  public deleteCraft = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.CRAFTS,
          businessId: userId 
        },
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Crafts listing not found or access denied',
        });
        return;
      }

      // Soft delete
      listing.isActive = false;
      listing.status = ListingStatus.ARCHIVED;
      await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Crafts listing deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting crafts listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get crafts by artist/business
   */
  public getCraftsByArtist = async (req: Request, res: Response): Promise<void> => {
    try {
      const artistId = parseInt(req.params.artistId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      const [listings, totalCount] = await this.listingRepository.findAndCount({
        where: { 
          businessId: artistId, 
          category: ListingCategory.CRAFTS,
          isActive: true 
        },
        relations: ['business'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const craftsListings = listings.map(listing => ({
        ...listing.toSummary(),
        isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
      }));

      res.status(200).json({
        success: true,
        message: 'Artist crafts listings retrieved successfully',
        data: {
          listings: craftsListings,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting artist crafts listings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get featured crafts (highly rated, recently created)
   */
  public getFeaturedCrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 12, 50);

      const listings = await this.listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.business', 'business')
        .where('listing.category = :category', { category: ListingCategory.CRAFTS })
        .andWhere('listing.isActive = :isActive', { isActive: true })
        .andWhere('listing.status = :status', { status: ListingStatus.ACTIVE })
        .andWhere('listing.averageRating >= :minRating', { minRating: 4.0 })
        .orderBy('listing.averageRating', 'DESC')
        .addOrderBy('listing.createdAt', 'DESC')
        .take(limit)
        .getMany();

      const featuredCrafts = listings.map(listing => ({
        ...listing.toSummary(),
        isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
      }));

      res.status(200).json({
        success: true,
        message: 'Featured crafts retrieved successfully',
        data: {
          listings: featuredCrafts,
        },
      });
    } catch (error) {
      console.error('Error getting featured crafts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Search crafts by text
   */
  public searchCrafts = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      if (!searchTerm) {
        res.status(400).json({
          success: false,
          message: 'Search term is required',
        });
        return;
      }

      const queryBuilder = this.listingRepository
        .createQueryBuilder('listing')
        .leftJoinAndSelect('listing.business', 'business')
        .where('listing.category = :category', { category: ListingCategory.CRAFTS })
        .andWhere('listing.isActive = :isActive', { isActive: true })
        .andWhere('listing.status = :status', { status: ListingStatus.ACTIVE })
        .andWhere(
          '(listing.title ILIKE :searchTerm OR listing.description ILIKE :searchTerm OR listing.artistName ILIKE :searchTerm OR listing.craftingTechnique ILIKE :searchTerm)',
          { searchTerm: `%${searchTerm}%` }
        );

      const totalCount = await queryBuilder.getCount();

      const listings = await queryBuilder
        .orderBy('listing.averageRating', 'DESC')
        .addOrderBy('listing.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      const searchResults = listings.map(listing => ({
        ...listing.toSummary(),
        isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
      }));

      res.status(200).json({
        success: true,
        message: 'Crafts search results retrieved successfully',
        data: {
          listings: searchResults,
          searchTerm,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error searching crafts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get crafts by category
   */
  public getCraftsByCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const category = req.params.category;
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      const [listings, totalCount] = await this.listingRepository.findAndCount({
        where: { 
          category: ListingCategory.CRAFTS,
          craftCategory: category as any,
          isActive: true,
          status: ListingStatus.ACTIVE
        },
        relations: ['business'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const categoryListings = listings.map(listing => ({
        ...listing.toSummary(),
        isAvailableForPurchase: listing.isCraftAvailableForPurchase(),
      }));

      res.status(200).json({
        success: true,
        message: `${category} crafts retrieved successfully`,
        data: {
          listings: categoryListings,
          category,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting crafts by category:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}