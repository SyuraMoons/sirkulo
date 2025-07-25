import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { RatingController } from '../controllers/rating.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { ResponseUtil } from '../utils/response.util';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const ratingController = new RatingController();

/**
 * Validation middleware to handle express-validator results
 */
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    ResponseUtil.validationError(res, errorMessages);
    return;
  }
  next();
};

/**
 * Rating routes with authentication and validation
 */

// Create a new rating
router.post(
  '/',
  authenticateToken,
  [
    body('listingId')
      .isInt({ min: 1 })
      .withMessage('Listing ID must be a positive integer'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Comment must be a string with maximum 1000 characters'),
  ],
  handleValidationErrors,
  ratingController.createRating
);

// Update an existing rating
router.put(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Rating ID must be a positive integer'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .isString()
      .isLength({ max: 1000 })
      .withMessage('Comment must be a string with maximum 1000 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  handleValidationErrors,
  ratingController.updateRating
);

// Delete a rating
router.delete(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Rating ID must be a positive integer'),
  ],
  handleValidationErrors,
  ratingController.deleteRating
);

// Get ratings for a specific listing
router.get(
  '/listing/:listingId',
  [
    param('listingId')
      .isInt({ min: 1 })
      .withMessage('Listing ID must be a positive integer'),
    query('minRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Minimum rating must be between 1 and 5'),
    query('maxRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Maximum rating must be between 1 and 5'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'rating', 'updatedAt'])
      .withMessage('Sort by must be one of: createdAt, rating, updatedAt'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  ratingController.getListingRatings
);

// Get rating statistics for a listing
router.get(
  '/listing/:listingId/stats',
  [
    param('listingId')
      .isInt({ min: 1 })
      .withMessage('Listing ID must be a positive integer'),
  ],
  handleValidationErrors,
  ratingController.getListingRatingStats
);

// Get current user's ratings
router.get(
  '/my-ratings',
  authenticateToken,
  [
    query('minRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Minimum rating must be between 1 and 5'),
    query('maxRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Maximum rating must be between 1 and 5'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'rating', 'updatedAt'])
      .withMessage('Sort by must be one of: createdAt, rating, updatedAt'),
    query('sortOrder')
      .optional()
      .isIn(['ASC', 'DESC'])
      .withMessage('Sort order must be ASC or DESC'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  handleValidationErrors,
  ratingController.getUserRatings
);

// Check if user can rate a listing
router.get(
  '/can-rate/:listingId',
  authenticateToken,
  [
    param('listingId')
      .isInt({ min: 1 })
      .withMessage('Listing ID must be a positive integer'),
  ],
  handleValidationErrors,
  ratingController.canUserRateListing
);

// Get a specific rating by ID
router.get(
  '/:id',
  [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Rating ID must be a positive integer'),
  ],
  handleValidationErrors,
  ratingController.getRatingById
);

export default router;