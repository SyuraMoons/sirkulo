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

// Helper function to safely parse query parameters
const parseNumber = (value: string | undefined): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return isNaN(parsed) ? undefined : parsed;
};

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (!value) return undefined;
  return value === 'true';
};

const parseArray = (value: any): any[] | undefined => {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
};

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
        wasteTypes: parseArray(req.query.wasteTypes) as WasteType[],
        status: parseArray(req.query.status) as ListingStatus[],
        minPrice: parseNumber(req.query.minPrice as string),
        maxPrice: parseNumber(req.query.maxPrice as string),
        minQuantity: parseNumber(req.query.minQuantity as string),
        maxQuantity: parseNumber(req.query.maxQuantity as string),
        unit: req.query.unit as string,
        isNegotiable: parseBoolean(req.query.isNegotiable as string),
        location: req.query.location as string,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
        latitude: parseNumber(req.query.latitude as string),
        longitude: parseNumber(req.query.longitude as string),
        radiusKm: parseNumber(req.query.radiusKm as string),
        createdAfter: req.query.createdAfter as string,
        createdBefore: req.query.createdBefore as string,
        tags: parseArray(req.query.tags) as string[],
        minRating: parseNumber(req.query.minRating as string),
        hasImages: parseBoolean(req.query.hasImages as string),
        certified: parseBoolean(req.query.certified as string),
        sortBy: (req.query.sortBy as SortBy) || SortBy.RELEVANCE,
        limit: Number(req.query.limit) || 20,
        offset: Number(req.query.offset) || 0,
        page: Number(req.query.page) || 1,
      };

      // Extract advanced filters
      const advancedFilters: AdvancedFilterDto = {
        businessTypes: parseArray(req.query.businessTypes) as string[],
        supplierIds: parseArray(req.query.supplierIds) as string[],
        minBusinessRating: parseNumber(req.query.minBusinessRating as string),
        verifiedSuppliers: parseBoolean(req.query.verifiedSuppliers as string),
        bulkAvailable: parseBoolean(req.query.bulkAvailable as string),
        minBulkQuantity: parseNumber(req.query.minBulkQuantity as string),
        colors: parseArray(req.query.colors) as string[],
        materials: parseArray(req.query.materials) as string[],
        conditions: parseArray(req.query.conditions) as string[],
        sustainabilityCertified: parseBoolean(req.query.sustainabilityCertified as string),
        certifications: parseArray(req.query.certifications) as string[],
      };

      // Get user ID if authenticated
      const userId = (req as any).user?.id;

      // Perform search
      const searchResults = await SearchService.searchListings(
        searchParams,
        advancedFilters,
        userId
      );

      return res.json({
        status: 'success',
        data: searchResults,
      });
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json({
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

      return res.json({
        status: 'success',
        data: {
          suggestions,
          query: params.query,
        },
      });
    } catch (error) {
      console.error('Suggestions error:', error);
      return res.status(500).json({
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
  async (_req: Request, res: Response) => {
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
  async (_req: Request, res: Response) => {
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