import { Repository } from 'typeorm';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { AppDataSource } from '../config/database';
import { CreateListingDto, UpdateListingDto, ListingSearchDto, PaginatedListingsResponseDto } from '../types/listing.dto';
import { ListingStatus, UserRole } from '../types';

/**
 * Service for managing waste listings
 */
export class ListingService {
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  constructor() {
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new listing
   */
  async createListing(createListingDto: CreateListingDto, businessId: number): Promise<Listing> {
    // Verify that the user is a business
    const business = await this.userRepository.findOne({
      where: { id: businessId }
    });

    if (!business) {
      throw new Error('Business not found');
    }

    if (!business.hasRole(UserRole.BUSINESS)) {
      throw new Error('Only businesses can create listings');
    }

    // Create the listing
    const listing = this.listingRepository.create({
      ...createListingDto,
      businessId,
      availableFrom: createListingDto.availableFrom ? new Date(createListingDto.availableFrom) : null,
      availableUntil: createListingDto.availableUntil ? new Date(createListingDto.availableUntil) : null,
    });

    return await this.listingRepository.save(listing);
  }

  /**
   * Get all listings with filtering and pagination
   */
  async getListings(searchDto: ListingSearchDto): Promise<PaginatedListingsResponseDto> {
    const {
      search,
      wasteType,
      status = ListingStatus.ACTIVE,
      city,
      state,
      country,
      minPrice,
      maxPrice,
      minQuantity,
      maxQuantity,
      unit,
      isNegotiable,
      latitude,
      longitude,
      radius,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      limit = 20,
    } = searchDto;

    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.business', 'business')
      .leftJoinAndSelect('listing.imageEntities', 'imageEntities')
      .where('listing.isActive = :isActive', { isActive: true })
      .andWhere('listing.status = :status', { status });

    // Text search
    if (search) {
      queryBuilder.andWhere(
        '(listing.title ILIKE :search OR listing.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Waste type filter
    if (wasteType) {
      queryBuilder.andWhere('listing.wasteType = :wasteType', { wasteType });
    }

    // Location filters
    if (city) {
      queryBuilder.andWhere('listing.location ->> \'city\' ILIKE :city', { city: `%${city}%` });
    }
    if (state) {
      queryBuilder.andWhere('listing.location ->> \'state\' ILIKE :state', { state: `%${state}%` });
    }
    if (country) {
      queryBuilder.andWhere('listing.location ->> \'country\' ILIKE :country', { country: `%${country}%` });
    }

    // Price filters
    if (minPrice !== undefined) {
      queryBuilder.andWhere(
        '(listing.pricePerUnit >= :minPrice OR listing.totalPrice >= :minPrice)',
        { minPrice }
      );
    }
    if (maxPrice !== undefined) {
      queryBuilder.andWhere(
        '(listing.pricePerUnit <= :maxPrice OR listing.totalPrice <= :maxPrice)',
        { maxPrice }
      );
    }

    // Quantity filters
    if (minQuantity !== undefined) {
      queryBuilder.andWhere('listing.quantity >= :minQuantity', { minQuantity });
    }
    if (maxQuantity !== undefined) {
      queryBuilder.andWhere('listing.quantity <= :maxQuantity', { maxQuantity });
    }

    // Unit filter
    if (unit) {
      queryBuilder.andWhere('listing.unit = :unit', { unit });
    }

    // Negotiable filter
    if (isNegotiable !== undefined) {
      queryBuilder.andWhere('listing.isNegotiable = :isNegotiable', { isNegotiable });
    }

    // Geographic distance filter
    if (latitude && longitude && radius) {
      queryBuilder.andWhere(`
        ST_DWithin(
          ST_SetSRID(ST_MakePoint(CAST(listing.location ->> 'longitude' AS FLOAT), CAST(listing.location ->> 'latitude' AS FLOAT)), 4326),
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
          :radius * 1000
        )
      `, { latitude, longitude, radius });
    }

    // Sorting
    if (sortBy === 'distance' && latitude && longitude) {
      queryBuilder.addSelect(`
        ST_Distance(
          ST_SetSRID(ST_MakePoint(CAST(listing.location ->> 'longitude' AS FLOAT), CAST(listing.location ->> 'latitude' AS FLOAT)), 4326),
          ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)
        )
      `, 'distance')
      .setParameters({ latitude, longitude })
      .orderBy('distance', sortOrder);
    } else if (sortBy === 'price') {
      queryBuilder.orderBy('COALESCE(listing.pricePerUnit, listing.totalPrice)', sortOrder);
    } else {
      queryBuilder.orderBy(`listing.${sortBy}`, sortOrder);
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [listings, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data: listings.map(listing => listing.toSummary()),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get a single listing by ID
   */
  async getListingById(id: number, userId?: number): Promise<Listing | null> {
    const listing = await this.listingRepository.findOne({
      where: { id, isActive: true },
      relations: ['business', 'imageEntities'],
    });

    if (listing && userId) {
      // Increment view count (only if not the owner)
      if (listing.businessId !== userId) {
        listing.incrementViewCount();
        await this.listingRepository.save(listing);
      }
    }

    return listing;
  }

  /**
   * Update a listing
   */
  async updateListing(id: number, updateListingDto: UpdateListingDto, businessId: number): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id, businessId, isActive: true },
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    // Update the listing
    Object.assign(listing, {
      ...updateListingDto,
      availableFrom: updateListingDto.availableFrom ? new Date(updateListingDto.availableFrom) : listing.availableFrom,
      availableUntil: updateListingDto.availableUntil ? new Date(updateListingDto.availableUntil) : listing.availableUntil,
    });

    return await this.listingRepository.save(listing);
  }

  /**
   * Delete a listing (soft delete)
   */
  async deleteListing(id: number, businessId: number): Promise<void> {
    const listing = await this.listingRepository.findOne({
      where: { id, businessId, isActive: true },
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    listing.isActive = false;
    listing.status = ListingStatus.INACTIVE;
    await this.listingRepository.save(listing);
  }

  /**
   * Get listings by business
   */
  async getListingsByBusiness(businessId: number, page: number = 1, limit: number = 20): Promise<PaginatedListingsResponseDto> {
    const offset = (page - 1) * limit;

    const [listings, total] = await this.listingRepository.findAndCount({
      where: { businessId },
      relations: ['business', 'imageEntities'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: listings.map(listing => listing.toSummary()),
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Update listing status
   */
  async updateListingStatus(id: number, status: ListingStatus, businessId: number): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id, businessId, isActive: true },
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    listing.status = status;
    return await this.listingRepository.save(listing);
  }

  /**
   * Get popular waste types
   */
  async getPopularWasteTypes(limit: number = 10): Promise<Array<{ wasteType: string; count: number }>> {
    const result = await this.listingRepository
      .createQueryBuilder('listing')
      .select('listing.wasteType', 'wasteType')
      .addSelect('COUNT(*)', 'count')
      .where('listing.isActive = :isActive', { isActive: true })
      .andWhere('listing.status = :status', { status: ListingStatus.ACTIVE })
      .groupBy('listing.wasteType')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      wasteType: item.wasteType,
      count: parseInt(item.count),
    }));
  }

  /**
   * Get listing statistics
   */
  async getListingStatistics(): Promise<{
    totalListings: number;
    activeListings: number;
    totalQuantity: number;
    averagePrice: number;
  }> {
    const stats = await this.listingRepository
      .createQueryBuilder('listing')
      .select([
        'COUNT(*) as totalListings',
        'SUM(CASE WHEN listing.status = :activeStatus THEN 1 ELSE 0 END) as activeListings',
        'SUM(listing.quantity) as totalQuantity',
        'AVG(COALESCE(listing.pricePerUnit, listing.totalPrice)) as averagePrice',
      ])
      .where('listing.isActive = :isActive', { isActive: true })
      .setParameter('activeStatus', ListingStatus.ACTIVE)
      .getRawOne();

    return {
      totalListings: parseInt(stats.totalListings) || 0,
      activeListings: parseInt(stats.activeListings) || 0,
      totalQuantity: parseFloat(stats.totalQuantity) || 0,
      averagePrice: parseFloat(stats.averagePrice) || 0,
    };
  }

  /**
   * Get images for a specific listing (including legacy images array)
   */
  async getListingImages(listingId: number): Promise<{
    imageEntities: any[];
    legacyImages: string[];
    allImages: string[];
  }> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, isActive: true },
      relations: ['imageEntities']
    });

    if (!listing) {
      throw new Error('Listing not found');
    }

    const imageEntities = listing.imageEntities ? 
      listing.imageEntities
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(img => ({
          id: img.id,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          caption: img.caption,
          altText: img.altText,
          displayOrder: img.displayOrder,
          width: img.width,
          height: img.height,
          format: img.format
        })) : [];

    const legacyImages = listing.images || [];
    const allImages = listing.getAllImageUrls();

    return {
      imageEntities,
      legacyImages,
      allImages
    };
  }

  /**
   * Add images to listing (update legacy images array)
   */
  async addImagesToListing(listingId: number, imageUrls: string[], businessId: number): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, businessId, isActive: true }
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    const currentImages = listing.images || [];
    listing.images = [...currentImages, ...imageUrls];

    return await this.listingRepository.save(listing);
  }

  /**
   * Remove images from listing (legacy images array)
   */
  async removeImagesFromListing(listingId: number, imageUrls: string[], businessId: number): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, businessId, isActive: true }
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    listing.images = (listing.images || []).filter(url => !imageUrls.includes(url));

    return await this.listingRepository.save(listing);
  }

  /**
   * Replace all listing images (legacy images array)
   */
  async replaceListingImages(listingId: number, imageUrls: string[], businessId: number): Promise<Listing> {
    const listing = await this.listingRepository.findOne({
      where: { id: listingId, businessId, isActive: true }
    });

    if (!listing) {
      throw new Error('Listing not found or access denied');
    }

    listing.images = imageUrls;

    return await this.listingRepository.save(listing);
  }
}
