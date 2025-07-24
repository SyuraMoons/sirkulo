import { Response } from 'express';
import { ListingService } from '../services/listing.service';
import { CreateListingDto, UpdateListingDto, ListingSearchDto } from '../types/listing.dto';
import { ResponseUtil } from '../utils/response.util';
import { ListingStatus } from '../types';
import { AuthenticatedRequest } from '../types/auth.dto';

/**
 * Controller for handling listing-related operations
 */
export class ListingController {
  private listingService: ListingService;

  constructor() {
    this.listingService = new ListingService();
  }

  /**
   * Create a new listing
   */
  createListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const createListingDto: CreateListingDto = req.body;
      const businessId = req.user!.userId;

      const listing = await this.listingService.createListing(createListingDto, businessId);

      ResponseUtil.success(res, listing, 'Listing created successfully', 201);
    } catch (error) {
      console.error('Error creating listing:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to create listing');
    }
  };

  /**
   * Get all listings with filtering and pagination
   */
  getListings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const searchDto: ListingSearchDto = {
        search: req.query.search as string,
        wasteType: req.query.wasteType as any,
        status: (req.query.status as any) || ListingStatus.ACTIVE,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minQuantity: req.query.minQuantity ? parseFloat(req.query.minQuantity as string) : undefined,
        maxQuantity: req.query.maxQuantity ? parseFloat(req.query.maxQuantity as string) : undefined,
        unit: req.query.unit as string,
        isNegotiable: req.query.isNegotiable ? req.query.isNegotiable === 'true' : undefined,
        latitude: req.query.latitude ? parseFloat(req.query.latitude as string) : undefined,
        longitude: req.query.longitude ? parseFloat(req.query.longitude as string) : undefined,
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        sortBy: (req.query.sortBy as any) || 'createdAt',
        sortOrder: (req.query.sortOrder as any) || 'DESC',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await this.listingService.getListings(searchDto);

      ResponseUtil.success(res, result, 'Listings retrieved successfully');
    } catch (error) {
      console.error('Error getting listings:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get listings');
    }
  };

  /**
   * Get a single listing by ID
   */
  getListingById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.userId;

      if (isNaN(id)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      const listing = await this.listingService.getListingById(id, userId);

      if (!listing) {
        ResponseUtil.notFound(res, 'Listing not found');
        return;
      }

      ResponseUtil.success(res, listing, 'Listing retrieved successfully');
    } catch (error) {
      console.error('Error getting listing:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get listing');
    }
  };

  /**
   * Update a listing
   */
  updateListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateListingDto: UpdateListingDto = req.body;
      const businessId = req.user!.userId;

      if (isNaN(id)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      const listing = await this.listingService.updateListing(id, updateListingDto, businessId);

      ResponseUtil.success(res, listing, 'Listing updated successfully');
    } catch (error) {
      console.error('Error updating listing:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to update listing');
    }
  };

  /**
   * Delete a listing
   */
  deleteListing = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const businessId = req.user!.userId;

      if (isNaN(id)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      await this.listingService.deleteListing(id, businessId);

      ResponseUtil.success(res, null, 'Listing deleted successfully');
    } catch (error) {
      console.error('Error deleting listing:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to delete listing');
    }
  };

  /**
   * Get listings by business (for business owners)
   */
  getMyListings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const businessId = req.user!.userId;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await this.listingService.getListingsByBusiness(businessId, page, limit);

      ResponseUtil.success(res, result, 'Your listings retrieved successfully');
    } catch (error) {
      console.error('Error getting business listings:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get your listings');
    }
  };

  /**
   * Update listing status
   */
  updateListingStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const businessId = req.user!.userId;

      if (isNaN(id)) {
        ResponseUtil.error(res, 'Invalid listing ID', 400);
        return;
      }

      if (!Object.values(ListingStatus).includes(status)) {
        ResponseUtil.error(res, 'Invalid status', 400);
        return;
      }

      const listing = await this.listingService.updateListingStatus(id, status, businessId);

      ResponseUtil.success(res, listing, 'Listing status updated successfully');
    } catch (error) {
      console.error('Error updating listing status:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to update listing status');
    }
  };

  /**
   * Get popular waste types
   */
  getPopularWasteTypes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const wasteTypes = await this.listingService.getPopularWasteTypes(limit);

      ResponseUtil.success(res, wasteTypes, 'Popular waste types retrieved successfully');
    } catch (error) {
      console.error('Error getting popular waste types:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get popular waste types');
    }
  };

  /**
   * Get listing statistics
   */
  getListingStatistics = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const statistics = await this.listingService.getListingStatistics();

      ResponseUtil.success(res, statistics, 'Listing statistics retrieved successfully');
    } catch (error) {
      console.error('Error getting listing statistics:', error);
      ResponseUtil.error(res, error instanceof Error ? error.message : 'Failed to get listing statistics');
    }
  };
}
