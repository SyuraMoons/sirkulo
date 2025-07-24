import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticateToken, requireActiveMode } from '../middlewares/auth.middleware';
import { validateDto } from '../middlewares/validation.middleware';
import { CreateListingDto, UpdateListingDto } from '../types/listing.dto';
import { UserRole } from '../types';
import { upload } from '../config/upload';

/**
 * Routes for waste listings management
 */
const router = Router();
const listingController = new ListingController();

// Public routes
/**
 * @route GET /api/listings
 * @desc Get all active listings with filtering and pagination
 * @access Public
 * @query {string} search - Search in title and description
 * @query {string} wasteType - Filter by waste type
 * @query {string} city - Filter by city
 * @query {string} state - Filter by state
 * @query {string} country - Filter by country
 * @query {number} minPrice - Minimum price filter
 * @query {number} maxPrice - Maximum price filter
 * @query {number} minQuantity - Minimum quantity filter
 * @query {number} maxQuantity - Maximum quantity filter
 * @query {string} unit - Filter by unit
 * @query {boolean} isNegotiable - Filter by negotiable status
 * @query {number} latitude - Latitude for distance filter
 * @query {number} longitude - Longitude for distance filter
 * @query {number} radius - Radius in kilometers for distance filter
 * @query {string} sortBy - Sort by field (createdAt, price, quantity, distance)
 * @query {string} sortOrder - Sort order (ASC, DESC)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 */
router.get('/', listingController.getListings);

/**
 * @route GET /api/listings/popular-waste-types
 * @desc Get popular waste types with counts
 * @access Public
 * @query {number} limit - Number of types to return (default: 10)
 */
router.get('/popular-waste-types', listingController.getPopularWasteTypes);

/**
 * @route GET /api/listings/statistics
 * @desc Get overall listing statistics
 * @access Public
 */
router.get('/statistics', listingController.getListingStatistics);

/**
 * @route GET /api/listings/:id
 * @desc Get a single listing by ID
 * @access Public (but tracks views if authenticated)
 * @param {number} id - Listing ID
 */
router.get('/:id', listingController.getListingById);

// Protected routes - require authentication
/**
 * @route POST /api/listings
 * @desc Create a new waste listing
 * @access Private (Business users only)
 * @body {CreateListingDto} Listing data
 */
router.post(
  '/',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  validateDto(CreateListingDto),
  listingController.createListing
);

/**
 * @route GET /api/listings/my/listings
 * @desc Get current user's listings
 * @access Private (Business users only)
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 */
router.get('/my/listings', authenticateToken, requireActiveMode(UserRole.BUSINESS), listingController.getMyListings);

/**
 * @route PUT /api/listings/:id
 * @desc Update a listing
 * @access Private (Owner only)
 * @param {number} id - Listing ID
 * @body {UpdateListingDto} Updated listing data
 */
router.put(
  '/:id',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  validateDto(UpdateListingDto),
  listingController.updateListing
);

/**
 * @route PATCH /api/listings/:id/status
 * @desc Update listing status
 * @access Private (Owner only)
 * @param {number} id - Listing ID
 * @body {object} { status: ListingStatus }
 */
router.patch('/:id/status', authenticateToken, requireActiveMode(UserRole.BUSINESS), listingController.updateListingStatus);

/**
 * @route DELETE /api/listings/:id
 * @desc Delete (deactivate) a listing
 * @access Private (Owner only)
 * @param {number} id - Listing ID
 */
router.delete('/:id', authenticateToken, requireActiveMode(UserRole.BUSINESS), listingController.deleteListing);

// Image management routes
/**
 * @route GET /api/listings/:listingId/images
 * @desc Get all images for a listing
 * @access Public
 * @param {number} listingId - Listing ID
 */
router.get('/:listingId/images', listingController.getListingImages);

/**
 * @route POST /api/listings/:listingId/images
 * @desc Upload images for a listing
 * @access Private (Owner only)
 * @param {number} listingId - Listing ID
 * @body {file[]} images - Image files to upload
 * @body {string[]} captions - Optional captions for images (JSON array)
 * @body {string[]} altTexts - Optional alt texts for images (JSON array)
 */
router.post(
  '/:listingId/images',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  upload.array('images', 10),
  listingController.uploadListingImages
);

/**
 * @route DELETE /api/listings/:listingId/images/:imageId
 * @desc Delete a specific image from listing
 * @access Private (Owner only)
 * @param {number} listingId - Listing ID
 * @param {number} imageId - Image ID
 */
router.delete(
  '/:listingId/images/:imageId',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  listingController.deleteListingImage
);

/**
 * @route PATCH /api/listings/:listingId/images/order
 * @desc Update the display order of listing images
 * @access Private (Owner only)
 * @param {number} listingId - Listing ID
 * @body {array} imageOrders - Array of {imageId, displayOrder} objects
 */
router.patch(
  '/:listingId/images/order',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  listingController.updateListingImageOrder
);

/**
 * @route PUT /api/listings/:listingId/images
 * @desc Replace all listing images (legacy method)
 * @access Private (Owner only)
 * @param {number} listingId - Listing ID
 * @body {string[]} imageUrls - Array of image URLs
 */
router.put(
  '/:listingId/images',
  authenticateToken,
  requireActiveMode(UserRole.BUSINESS),
  listingController.replaceListingImages
);

export default router;
