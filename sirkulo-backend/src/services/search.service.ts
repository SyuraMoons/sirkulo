import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import {
  SearchListingsDto,
  AdvancedFilterDto,
  SearchResultDto,
  SearchResponseDto,
  FacetDto,
  SortBy,
  SearchSuggestionsDto,
  SavedSearchDto,
  SearchAnalyticsDto
} from '../types/search.dto';
import { WasteType, ListingStatus } from '../types/enums';

/**
 * Advanced search service for marketplace listings
 * Provides comprehensive search, filtering, and analytics capabilities
 */
export class SearchService {
  private static instance: SearchService;
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  private constructor() {
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  /**
   * Main search method with comprehensive filtering
   */
  public async searchListings(
    searchParams: SearchListingsDto,
    advancedFilters?: AdvancedFilterDto,
    userId?: number
  ): Promise<SearchResponseDto> {
    const startTime = Date.now();

    try {
      // Build the base query
      const queryBuilder = this.buildBaseQuery(searchParams, advancedFilters);

      // Apply text search
      if (searchParams.query) {
        this.applyTextSearch(queryBuilder, searchParams.query);
      }

      // Apply filters
      this.applyFilters(queryBuilder, searchParams, advancedFilters);

      // Apply sorting
      this.applySorting(queryBuilder, searchParams.sortBy, searchParams);

      // Get total count for pagination
      const totalCount = await queryBuilder.getCount();

      // Apply pagination
      const limit = Math.min(searchParams.limit || 20, 100);
      const offset = searchParams.offset || (searchParams.page ? (searchParams.page - 1) * limit : 0);
      
      queryBuilder.limit(limit).offset(offset);

      // Execute query
      const listings = await queryBuilder.getMany();

      // Transform results
      const results = await this.transformResults(listings, searchParams);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      // Get filter facets
      const availableFilters = await this.getFilterFacets(searchParams, advancedFilters);

      // Generate suggestions if query provided
      const suggestions = searchParams.query ? 
        await this.generateSuggestions(searchParams.query) : undefined;

      const executionTime = Date.now() - startTime;

      // Track search analytics
      if (userId) {
        await this.trackSearchAnalytics({
          query: searchParams.query || '',
          filters: { ...searchParams, ...advancedFilters },
          resultsCount: totalCount,
          clickedResults: [],
          userId,
          sessionId: this.generateSessionId(),
          timestamp: new Date(),
          executionTime,
        });
      }

      return {
        results,
        pagination: {
          total: totalCount,
          page: currentPage,
          limit,
          totalPages,
          hasNext: currentPage < totalPages,
          hasPrev: currentPage > 1,
        },
        filters: {
          applied: { ...searchParams, ...advancedFilters },
          available: availableFilters,
        },
        suggestions,
        executionTime,
      };
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Search operation failed');
    }
  }

  /**
   * Build base query with joins
   */
  private buildBaseQuery(
    searchParams: SearchListingsDto,
    advancedFilters?: AdvancedFilterDto
  ): SelectQueryBuilder<Listing> {
    const queryBuilder = this.listingRepository
      .createQueryBuilder('listing')
      .leftJoinAndSelect('listing.user', 'user')
      .leftJoinAndSelect('listing.images', 'images')
      .leftJoinAndSelect('user.businessProfile', 'businessProfile')
      .select([
        'listing.id',
        'listing.title',
        'listing.description',
        'listing.wasteType',
        'listing.quantity',
        'listing.unit',
        'listing.pricePerUnit',
        'listing.totalPrice',
        'listing.isNegotiable',
        'listing.status',
        'listing.location',
        'listing.tags',
        'listing.createdAt',
        'listing.updatedAt',
        'listing.qualityGrade',
        'listing.materialComposition',
        'listing.color',
        'listing.condition',
        'listing.minimumOrderQuantity',
        'listing.bulkPricing',
        'listing.sustainabilityCertification',
        'user.id',
        'user.email',
        'user.firstName',
        'user.lastName',
        'businessProfile.companyName',
        'businessProfile.businessType',
        'businessProfile.verificationStatus',
        'businessProfile.rating',
        'images.id',
        'images.filename',
        'images.url',
        'images.isPrimary'
      ]);

    return queryBuilder;
  }

  /**
   * Apply text search with relevance scoring
   */
  private applyTextSearch(queryBuilder: SelectQueryBuilder<Listing>, query: string): void {
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    if (searchTerms.length === 0) return;

    queryBuilder.addSelect(`
      (
        CASE WHEN LOWER(listing.title) LIKE :exactQuery THEN 100 ELSE 0 END +
        CASE WHEN LOWER(listing.description) LIKE :exactQuery THEN 50 ELSE 0 END +
        ${searchTerms.map((_, index) => `
          CASE WHEN LOWER(listing.title) LIKE :term${index} THEN 30 ELSE 0 END +
          CASE WHEN LOWER(listing.description) LIKE :term${index} THEN 15 ELSE 0 END +
          CASE WHEN LOWER(listing.tags) LIKE :term${index} THEN 20 ELSE 0 END
        `).join(' + ')}
      )
    `, 'relevanceScore');

    queryBuilder.andWhere(
      new Brackets(qb => {
        qb.where('LOWER(listing.title) LIKE :exactQuery')
          .orWhere('LOWER(listing.description) LIKE :exactQuery')
          .orWhere('LOWER(listing.tags) LIKE :exactQuery');
        
        searchTerms.forEach((_, index) => {
          qb.orWhere(`LOWER(listing.title) LIKE :term${index}`)
            .orWhere(`LOWER(listing.description) LIKE :term${index}`)
            .orWhere(`LOWER(listing.tags) LIKE :term${index}`);
        });
      })
    );

    queryBuilder.setParameter('exactQuery', `%${query.toLowerCase()}%`);
    searchTerms.forEach((term, index) => {
      queryBuilder.setParameter(`term${index}`, `%${term}%`);
    });
  }

  /**
   * Apply all filters to the query
   */
  private applyFilters(
    queryBuilder: SelectQueryBuilder<Listing>,
    searchParams: SearchListingsDto,
    advancedFilters?: AdvancedFilterDto
  ): void {
    // Basic filters
    if (searchParams.wasteTypes?.length) {
      queryBuilder.andWhere('listing.wasteType IN (:...wasteTypes)', {
        wasteTypes: searchParams.wasteTypes
      });
    }

    if (searchParams.status?.length) {
      queryBuilder.andWhere('listing.status IN (:...statuses)', {
        statuses: searchParams.status
      });
    }

    // Price range
    if (searchParams.minPrice !== undefined) {
      queryBuilder.andWhere('listing.pricePerUnit >= :minPrice', {
        minPrice: searchParams.minPrice
      });
    }

    if (searchParams.maxPrice !== undefined) {
      queryBuilder.andWhere('listing.pricePerUnit <= :maxPrice', {
        maxPrice: searchParams.maxPrice
      });
    }

    // Quantity range
    if (searchParams.minQuantity !== undefined) {
      queryBuilder.andWhere('listing.quantity >= :minQuantity', {
        minQuantity: searchParams.minQuantity
      });
    }

    if (searchParams.maxQuantity !== undefined) {
      queryBuilder.andWhere('listing.quantity <= :maxQuantity', {
        maxQuantity: searchParams.maxQuantity
      });
    }

    // Unit filter
    if (searchParams.unit) {
      queryBuilder.andWhere('LOWER(listing.unit) = LOWER(:unit)', {
        unit: searchParams.unit
      });
    }

    // Negotiable filter
    if (searchParams.isNegotiable !== undefined) {
      queryBuilder.andWhere('listing.isNegotiable = :isNegotiable', {
        isNegotiable: searchParams.isNegotiable
      });
    }

    // Location filters
    this.applyLocationFilters(queryBuilder, searchParams);

    // Date filters
    if (searchParams.createdAfter) {
      queryBuilder.andWhere('listing.createdAt >= :createdAfter', {
        createdAfter: new Date(searchParams.createdAfter)
      });
    }

    if (searchParams.createdBefore) {
      queryBuilder.andWhere('listing.createdAt <= :createdBefore', {
        createdBefore: new Date(searchParams.createdBefore)
      });
    }

    // Tags filter
    if (searchParams.tags?.length) {
      const tagConditions = searchParams.tags.map((_, index) => 
        `listing.tags LIKE :tag${index}`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${tagConditions})`);
      searchParams.tags.forEach((tag, index) => {
        queryBuilder.setParameter(`tag${index}`, `%${tag}%`);
      });
    }

    // Advanced filters
    if (advancedFilters) {
      this.applyAdvancedFilters(queryBuilder, advancedFilters);
    }

    // Default to active listings only unless specified
    if (!searchParams.status?.length) {
      queryBuilder.andWhere('listing.status = :defaultStatus', {
        defaultStatus: ListingStatus.ACTIVE
      });
    }
  }

  /**
   * Apply location-based filters including radius search
   */
  private applyLocationFilters(
    queryBuilder: SelectQueryBuilder<Listing>,
    searchParams: SearchListingsDto
  ): void {
    if (searchParams.city) {
      queryBuilder.andWhere("listing.location->>'city' ILIKE :city", {
        city: `%${searchParams.city}%`
      });
    }

    if (searchParams.state) {
      queryBuilder.andWhere("listing.location->>'state' ILIKE :state", {
        state: `%${searchParams.state}%`
      });
    }

    if (searchParams.country) {
      queryBuilder.andWhere("listing.location->>'country' ILIKE :country", {
        country: `%${searchParams.country}%`
      });
    }

    // Radius search using Haversine formula
    if (searchParams.latitude && searchParams.longitude && searchParams.radiusKm) {
      queryBuilder.andWhere(`
        (6371 * acos(
          cos(radians(:lat)) * 
          cos(radians(CAST(listing.location->>'latitude' AS FLOAT))) * 
          cos(radians(CAST(listing.location->>'longitude' AS FLOAT)) - radians(:lng)) + 
          sin(radians(:lat)) * 
          sin(radians(CAST(listing.location->>'latitude' AS FLOAT)))
        )) <= :radius
      `, {
        lat: searchParams.latitude,
        lng: searchParams.longitude,
        radius: searchParams.radiusKm
      });
    }
  }

  /**
   * Apply advanced filters
   */
  private applyAdvancedFilters(
    queryBuilder: SelectQueryBuilder<Listing>,
    advancedFilters: AdvancedFilterDto
  ): void {
    if (advancedFilters.businessTypes?.length) {
      queryBuilder.andWhere('businessProfile.businessType IN (:...businessTypes)', {
        businessTypes: advancedFilters.businessTypes
      });
    }

    if (advancedFilters.verifiedSuppliers) {
      queryBuilder.andWhere('businessProfile.verificationStatus = :verified', {
        verified: 'verified'
      });
    }

    if (advancedFilters.minBusinessRating !== undefined) {
      queryBuilder.andWhere('businessProfile.rating >= :minRating', {
        minRating: advancedFilters.minBusinessRating
      });
    }

    if (advancedFilters.colors?.length) {
      const colorConditions = advancedFilters.colors.map((_, index) => 
        `LOWER(listing.color) LIKE :color${index}`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${colorConditions})`);
      advancedFilters.colors.forEach((color, index) => {
        queryBuilder.setParameter(`color${index}`, `%${color.toLowerCase()}%`);
      });
    }

    if (advancedFilters.materials?.length) {
      const materialConditions = advancedFilters.materials.map((_, index) => 
        `listing.materialComposition LIKE :material${index}`
      ).join(' OR ');
      
      queryBuilder.andWhere(`(${materialConditions})`);
      advancedFilters.materials.forEach((material, index) => {
        queryBuilder.setParameter(`material${index}`, `%${material}%`);
      });
    }

    if (advancedFilters.sustainabilityCertified) {
      queryBuilder.andWhere('listing.sustainabilityCertification IS NOT NULL');
    }
  }

  /**
   * Apply sorting to the query
   */
  private applySorting(
    queryBuilder: SelectQueryBuilder<Listing>,
    sortBy?: SortBy,
    searchParams?: SearchListingsDto
  ): void {
    switch (sortBy) {
      case SortBy.RELEVANCE:
        if (searchParams?.query) {
          queryBuilder.orderBy('relevanceScore', 'DESC');
        } else {
          queryBuilder.orderBy('listing.createdAt', 'DESC');
        }
        break;
      case SortBy.PRICE_LOW_HIGH:
        queryBuilder.orderBy('listing.pricePerUnit', 'ASC');
        break;
      case SortBy.PRICE_HIGH_LOW:
        queryBuilder.orderBy('listing.pricePerUnit', 'DESC');
        break;
      case SortBy.DATE_NEWEST:
        queryBuilder.orderBy('listing.createdAt', 'DESC');
        break;
      case SortBy.DATE_OLDEST:
        queryBuilder.orderBy('listing.createdAt', 'ASC');
        break;
      case SortBy.QUANTITY_LOW_HIGH:
        queryBuilder.orderBy('listing.quantity', 'ASC');
        break;
      case SortBy.QUANTITY_HIGH_LOW:
        queryBuilder.orderBy('listing.quantity', 'DESC');
        break;
      case SortBy.RATING:
        queryBuilder.orderBy('businessProfile.rating', 'DESC');
        break;
      case SortBy.DISTANCE:
        if (searchParams?.latitude && searchParams?.longitude) {
          queryBuilder.orderBy(`
            (6371 * acos(
              cos(radians(${searchParams.latitude})) * 
              cos(radians(CAST(listing.location->>'latitude' AS FLOAT))) * 
              cos(radians(CAST(listing.location->>'longitude' AS FLOAT)) - radians(${searchParams.longitude})) + 
              sin(radians(${searchParams.latitude})) * 
              sin(radians(CAST(listing.location->>'latitude' AS FLOAT)))
            ))
          `, 'ASC');
        } else {
          queryBuilder.orderBy('listing.createdAt', 'DESC');
        }
        break;
      default:
        queryBuilder.orderBy('listing.createdAt', 'DESC');
    }

    // Secondary sort by ID for consistent pagination
    queryBuilder.addOrderBy('listing.id', 'DESC');
  }

  /**
   * Transform database results to DTOs
   */
  private async transformResults(
    listings: Listing[],
    searchParams: SearchListingsDto
  ): Promise<SearchResultDto[]> {
    return listings.map(listing => {
      let distance: number | undefined;
      
      // Calculate distance if coordinates provided
      if (searchParams.latitude && searchParams.longitude && 
          listing.location?.latitude && listing.location?.longitude) {
        distance = this.calculateDistance(
          searchParams.latitude,
          searchParams.longitude,
          listing.location.latitude,
          listing.location.longitude
        );
      }

      return {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        wasteType: listing.wasteType as WasteType,
        quantity: listing.quantity,
        unit: listing.unit,
        pricePerUnit: listing.pricePerUnit,
        totalPrice: listing.totalPrice,
        isNegotiable: listing.isNegotiable,
        status: listing.status as ListingStatus,
        location: {
          city: listing.location?.city || '',
          state: listing.location?.state || '',
          country: listing.location?.country || '',
          latitude: listing.location?.latitude,
          longitude: listing.location?.longitude,
          distance,
        },
        supplier: {
          id: listing.user.id,
          businessName: listing.user.businessProfile?.companyName || `${listing.user.firstName} ${listing.user.lastName}`,
          rating: listing.user.businessProfile?.rating || 0,
          verified: listing.user.businessProfile?.verificationStatus === 'verified',
          memberSince: listing.user.createdAt,
        },
        images: listing.images?.map(img => img.url) || [],
        tags: listing.tags || [],
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
        relevanceScore: (listing as any).relevanceScore,
      };
    });
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Get filter facets for available filter options
   */
  private async getFilterFacets(
    searchParams: SearchListingsDto,
    advancedFilters?: AdvancedFilterDto
  ): Promise<any> {
    // This would typically involve additional queries to get counts for each filter option
    // For now, returning a basic structure
    return {
      wasteTypes: Object.values(WasteType).map(type => ({ value: type, count: 0 })),
      priceRanges: [
        { min: 0, max: 1000, count: 0 },
        { min: 1000, max: 5000, count: 0 },
        { min: 5000, max: 10000, count: 0 },
        { min: 10000, max: 50000, count: 0 },
      ],
      locations: [],
      suppliers: [],
    };
  }

  /**
   * Generate search suggestions
   */
  private async generateSuggestions(query: string): Promise<string[]> {
    // This would typically use a dedicated search engine or suggestion service
    // For now, returning basic suggestions based on common terms
    const commonTerms = [
      'fabric scraps', 'textile waste', 'cotton waste', 'polyester waste',
      'leather offcuts', 'yarn waste', 'button zippers', 'packaging materials'
    ];

    return commonTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }

  /**
   * Track search analytics
   */
  private async trackSearchAnalytics(analytics: SearchAnalyticsDto): Promise<void> {
    // In a real implementation, this would save to analytics database or service
    console.log('Search analytics:', {
      query: analytics.query,
      resultsCount: analytics.resultsCount,
      userId: analytics.userId,
      executionTime: analytics.executionTime,
    });
  }

  /**
   * Generate session ID for analytics
   */
  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Get search suggestions
   */
  public async getSearchSuggestions(params: SearchSuggestionsDto): Promise<string[]> {
    if (!params.query) return [];

    const suggestions = await this.generateSuggestions(params.query);
    return suggestions.slice(0, params.limit || 5);
  }

  /**
   * Save search for user
   */
  public async saveSearch(userId: number, savedSearch: SavedSearchDto): Promise<boolean> {
    try {
      // In a real implementation, this would save to the database
      console.log(`Saving search for user ${userId}:`, savedSearch);
      return true;
    } catch (error) {
      console.error('Failed to save search:', error);
      return false;
    }
  }

  /**
   * Get popular searches
   */
  public async getPopularSearches(limit: number = 10): Promise<string[]> {
    // In a real implementation, this would query analytics data
    return [
      'cotton fabric scraps',
      'polyester waste',
      'leather offcuts',
      'yarn waste',
      'textile recycling materials',
    ].slice(0, limit);
  }
}

export default SearchService.getInstance();