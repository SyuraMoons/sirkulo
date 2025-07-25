import { Router, Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.middleware';
import SearchService from '../services/search.service';
import {
  SearchListingsDto,
  AdvancedFilterDto,
  SearchSuggestionsDto,
  SavedSearchDto,
  SortBy
} from '../types/search.dto';
import { WasteType, ListingStatus } from '../types/enums';

const router = Router();

/**
 * Search listings with comprehensive filtering
 * GET /api/search/listings
 */
router.get('/listings',
  [
    // Query parameters validation
    query('query').optional().isString().trim(),
    query('wasteTypes').optional().isArray(),
    query('status').optional().isArray(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('minQuantity').optional().isFloat({ min: 0 }).toFloat(),
    query('maxQuantity').optional().isFloat({ min: 0 }).toFloat(),
    query('unit').optional().isString().trim(),
    query('isNegotiable').optional().isBoolean().toBoolean(),
    query('location').optional().isString().trim(),
    query('city').optional().isString().trim(),
    query('state').optional().isString().trim(),
    query('country').optional().isString().trim(),
    query('latitude').optional().isFloat().toFloat(),
    query('longitude').optional().isFloat().toFloat(),
    query('radiusKm').optional().isInt({ min: 1, max: 500 }).toInt(),
    query('createdAfter').optional().isISO8601().toDate(),
    query('createdBefore').optional().isISO8601().toDate(),
    query('tags').optional().isArray(),
    query('minRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
    query('hasImages').optional().isBoolean().toBoolean(),
    query('certified').optional().isBoolean().toBoolean(),
    query('sortBy').optional().isIn(Object.values(SortBy)),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    
    // Advanced filters
    query('businessTypes').optional().isArray(),
    query('supplierIds').optional().isArray(),
    query('minBusinessRating').optional().isFloat({ min: 0, max: 5 }).toFloat(),
    query('verifiedSuppliers').optional().isBoolean().toBoolean(),
    query('bulkAvailable').optional().isBoolean().toBoolean(),
    query('minBulkQuantity').optional().isFloat({ min: 0 }).toFloat(),
    query('colors').optional().isArray(),
    query('materials').optional().isArray(),
    query('conditions').optional().isArray(),
    query('sustainabilityCertified').optional().isBoolean().toBoolean(),
    query('certifications').optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      // Extract search parameters
      const searchParams: SearchListingsDto = {
        query: req.query.query as string,
        wasteTypes: req.query.wasteTypes as WasteType[],
        status: req.query.status as ListingStatus[],
        minPrice: req.query.minPrice as number,
        maxPrice: req.query.maxPrice as number,
        minQuantity: req.query.minQuantity as number,
        maxQuantity: req.query.maxQuantity as number,
        unit: req.query.unit as string,
        isNegotiable: req.query.isNegotiable as boolean,
        location: req.query.location as string,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
        latitude: req.query.latitude as number,
        longitude: req.query.longitude as number,
        radiusKm: req.query.radiusKm as number,
        createdAfter: req.query.createdAfter as string,
        createdBefore: req.query.createdBefore as string,
        tags: req.query.tags as string[],
        minRating: req.query.minRating as number,
        hasImages: req.query.hasImages as boolean,
        certified: req.query.certified as boolean,
        sortBy: (req.query.sortBy as SortBy) || SortBy.RELEVANCE,
        limit: Number(req.query.limit) || 20,
        offset: Number(req.query.offset) || 0,
        page: Number(req.query.page) || 1,
      };

      // Extract advanced filters
      const advancedFilters: AdvancedFilterDto = {
        businessTypes: req.query.businessTypes as string[],
        supplierIds: req.query.supplierIds as string[],
        minBusinessRating: req.query.minBusinessRating as number,
        verifiedSuppliers: req.query.verifiedSuppliers as boolean,
        bulkAvailable: req.query.bulkAvailable as boolean,
        minBulkQuantity: req.query.minBulkQuantity as number,
        colors: req.query.colors as string[],
        materials: req.query.materials as string[],
        conditions: req.query.conditions as string[],
        sustainabilityCertified: req.query.sustainabilityCertified as boolean,
        certifications: req.query.certifications as string[],
      };

      // Get user ID if authenticated
      const userId = (req as any).user?.id;

      // Perform search
      const searchResults = await SearchService.searchListings(
        searchParams,
        advancedFilters,
        userId
      );

      res.json({
        status: 'success',
        data: searchResults,
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Search operation failed',
      });
    }
  }
);

/**
 * Get search suggestions
 * GET /api/search/suggestions
 */
router.get('/suggestions',
  [
    query('query').optional().isString().trim(),
    query('limit').optional().isInt({ min: 1, max: 10 }).toInt(),
    query('type').optional().isIn(['listings', 'suppliers', 'locations', 'materials']),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const params: SearchSuggestionsDto = {
        query: req.query.query as string,
        limit: Number(req.query.limit) || 5,
        type: req.query.type as any,
      };

      const suggestions = await SearchService.getSearchSuggestions(params);

      res.json({
        status: 'success',
        data: {
          suggestions,
          query: params.query,
        },
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get suggestions',
      });
    }
  }
);

/**
 * Get popular searches
 * GET /api/search/popular
 */
router.get('/popular',
  [
    query('limit').optional().isInt({ min: 1, max: 20 }).toInt(),
  ],
  async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 10;
      const popularSearches = await SearchService.getPopularSearches(limit);

      res.json({
        status: 'success',
        data: {
          searches: popularSearches,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Popular searches error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get popular searches',
      });
    }
  }
);

/**
 * Save search for authenticated user
 * POST /api/search/save
 */
router.post('/save',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const savedSearch: SavedSearchDto = req.body;

      const success = await SearchService.saveSearch(userId, savedSearch);

      if (success) {
        res.json({
          status: 'success',
          message: 'Search saved successfully',
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'Failed to save search',
        });
      }
    } catch (error) {
      console.error('Save search error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to save search',
      });
    }
  }
);

/**
 * Get filter options and facets
 * GET /api/search/filters
 */
router.get('/filters',
  async (req: Request, res: Response) => {
    try {
      const filterOptions = {
        wasteTypes: Object.values(WasteType).map(type => ({
          value: type,
          label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        })),
        statuses: Object.values(ListingStatus).map(status => ({
          value: status,
          label: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        })),
        sortOptions: Object.values(SortBy).map(sort => ({
          value: sort,
          label: sort.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        })),
        units: [
          { value: 'kg', label: 'Kilograms' },
          { value: 'tonnes', label: 'Tonnes' },
          { value: 'meters', label: 'Meters' },
          { value: 'pieces', label: 'Pieces' },
          { value: 'rolls', label: 'Rolls' },
          { value: 'yards', label: 'Yards' },
        ],
        priceRanges: [
          { min: 0, max: 1000, label: 'Under $1,000' },
          { min: 1000, max: 5000, label: '$1,000 - $5,000' },
          { min: 5000, max: 10000, label: '$5,000 - $10,000' },
          { min: 10000, max: 50000, label: '$10,000 - $50,000' },
          { min: 50000, max: null, label: 'Over $50,000' },
        ],
        radiusOptions: [
          { value: 10, label: '10 km' },
          { value: 25, label: '25 km' },
          { value: 50, label: '50 km' },
          { value: 100, label: '100 km' },
          { value: 250, label: '250 km' },
          { value: 500, label: '500 km' },
        ],
      };

      res.json({
        status: 'success',
        data: filterOptions,
      });
    } catch (error) {
      console.error('Filter options error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get filter options',
      });
    }
  }
);

/**
 * Search analytics endpoint (for admin/internal use)
 * GET /api/search/analytics
 */
router.get('/analytics',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      // This would typically require admin permissions
      const analytics = {
        totalSearches: 0,
        popularQueries: [],
        conversionRate: 0,
        averageExecutionTime: 0,
        filterUsage: {},
        noResultsQueries: [],
        timestamp: new Date().toISOString(),
      };

      res.json({
        status: 'success',
        data: analytics,
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get analytics',
      });
    }
  }
);

export default router;