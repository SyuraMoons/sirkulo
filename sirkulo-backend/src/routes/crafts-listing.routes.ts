import express from 'express';
import { CraftsListingController } from '../controllers/crafts-listing.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();
const craftsController = new CraftsListingController();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
  }
  return next();
};

// Create crafts validation
const createCraftsValidation = [
  body('title')
    .isString()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .isString()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('craftMaterial')
    .isIn(['recycled_plastic', 'upcycled_fabric', 'reclaimed_wood', 'recycled_metal', 'repurposed_glass', 'mixed_materials', 'other'])
    .withMessage('Invalid craft material'),
  body('craftCategory')
    .isIn(['artwork', 'furniture', 'accessories', 'home_decor', 'jewelry', 'bags_purses', 'clothing', 'toys', 'functional_items', 'other'])
    .withMessage('Invalid craft category'),
  body('pricePerUnit')
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('quantity')
    .isFloat({ min: 0.01 })
    .withMessage('Quantity must be greater than 0'),
  body('unit')
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('Unit must be between 1 and 20 characters'),
  body('location')
    .isObject()
    .withMessage('Location is required'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('craftingTechnique')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Crafting technique must be at most 200 characters'),
  body('dimensions')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Dimensions must be at most 100 characters'),
  body('careInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Care instructions must be at most 500 characters'),
  body('isCustomizable')
    .optional()
    .isBoolean()
    .withMessage('isCustomizable must be a boolean'),
  body('estimatedCraftingTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated crafting time must be a positive integer'),
  body('artistName')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Artist name must be at most 100 characters'),
  body('artistBio')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Artist bio must be at most 1000 characters'),
];

// Update crafts validation
const updateCraftsValidation = [
  body('title')
    .optional()
    .isString()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('craftMaterial')
    .optional()
    .isIn(['recycled_plastic', 'upcycled_fabric', 'reclaimed_wood', 'recycled_metal', 'repurposed_glass', 'mixed_materials', 'other'])
    .withMessage('Invalid craft material'),
  body('craftCategory')
    .optional()
    .isIn(['artwork', 'furniture', 'accessories', 'home_decor', 'jewelry', 'bags_purses', 'clothing', 'toys', 'functional_items', 'other'])
    .withMessage('Invalid craft category'),
  body('pricePerUnit')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0'),
  body('craftingTechnique')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Crafting technique must be at most 200 characters'),
  body('dimensions')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Dimensions must be at most 100 characters'),
  body('careInstructions')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Care instructions must be at most 500 characters'),
  body('isCustomizable')
    .optional()
    .isBoolean()
    .withMessage('isCustomizable must be a boolean'),
  body('estimatedCraftingTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Estimated crafting time must be a positive integer'),
  body('artistName')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Artist name must be at most 100 characters'),
  body('artistBio')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Artist bio must be at most 1000 characters'),
];

// Filter validation
const craftsFiltersValidation = [
  query('material')
    .optional()
    .isIn(['recycled_plastic', 'upcycled_fabric', 'reclaimed_wood', 'recycled_metal', 'repurposed_glass', 'mixed_materials', 'other'])
    .withMessage('Invalid material filter'),
  query('category')
    .optional()
    .isIn(['artwork', 'furniture', 'accessories', 'home_decor', 'jewelry', 'bags_purses', 'clothing', 'toys', 'functional_items', 'other'])
    .withMessage('Invalid category filter'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Min price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Max price must be a positive number'),
  query('isCustomizable')
    .optional()
    .isBoolean()
    .withMessage('isCustomizable must be a boolean'),
  query('artistName')
    .optional()
    .isString()
    .isLength({ max: 100 })
    .withMessage('Artist name must be at most 100 characters'),
  query('maxCraftingTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max crafting time must be a positive integer'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'rating', 'craftingTime', 'title'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Sort order must be ASC or DESC'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCraftsRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - craftMaterial
 *         - craftCategory
 *         - pricePerUnit
 *         - quantity
 *         - unit
 *         - location
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         description:
 *           type: string
 *           minLength: 20
 *           maxLength: 2000
 *         craftMaterial:
 *           type: string
 *           enum: [recycled_plastic, upcycled_fabric, reclaimed_wood, recycled_metal, repurposed_glass, mixed_materials, other]
 *         craftCategory:
 *           type: string
 *           enum: [artwork, furniture, accessories, home_decor, jewelry, bags_purses, clothing, toys, functional_items, other]
 *         pricePerUnit:
 *           type: number
 *           minimum: 0.01
 *         quantity:
 *           type: number
 *           minimum: 0.01
 *         unit:
 *           type: string
 *           minLength: 1
 *           maxLength: 20
 *         location:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             country:
 *               type: string
 *             postalCode:
 *               type: string
 *         craftingTechnique:
 *           type: string
 *           maxLength: 200
 *         dimensions:
 *           type: string
 *           maxLength: 100
 *         careInstructions:
 *           type: string
 *           maxLength: 500
 *         isCustomizable:
 *           type: boolean
 *         estimatedCraftingTime:
 *           type: integer
 *           minimum: 1
 *         artistName:
 *           type: string
 *           maxLength: 100
 *         artistBio:
 *           type: string
 *           maxLength: 1000
 */

/**
 * @swagger
 * /api/crafts:
 *   post:
 *     summary: Create a new crafts listing
 *     tags: [Crafts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCraftsRequest'
 *     responses:
 *       201:
 *         description: Crafts listing created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only businesses and recyclers can create crafts listings
 */
router.post('/',
  authenticateToken,
  createCraftsValidation,
  handleValidationErrors,
  craftsController.createCraft
);

/**
 * @swagger
 * /api/crafts:
 *   get:
 *     summary: Get all crafts listings
 *     tags: [Crafts]
 *     parameters:
 *       - in: query
 *         name: material
 *         schema:
 *           type: string
 *           enum: [recycled_plastic, upcycled_fabric, reclaimed_wood, recycled_metal, repurposed_glass, mixed_materials, other]
 *         description: Filter by craft material
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [artwork, furniture, accessories, home_decor, jewelry, bags_purses, clothing, toys, functional_items, other]
 *         description: Filter by craft category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: isCustomizable
 *         schema:
 *           type: boolean
 *         description: Filter by customizable crafts
 *       - in: query
 *         name: artistName
 *         schema:
 *           type: string
 *         description: Filter by artist name
 *       - in: query
 *         name: maxCraftingTime
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Maximum crafting time filter
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, price, rating, craftingTime, title]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Crafts listings retrieved successfully
 *       400:
 *         description: Invalid filter parameters
 */
router.get('/',
  craftsFiltersValidation,
  handleValidationErrors,
  craftsController.getCrafts
);

/**
 * @swagger
 * /api/crafts/featured:
 *   get:
 *     summary: Get featured crafts listings
 *     tags: [Crafts]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of featured crafts to return
 *     responses:
 *       200:
 *         description: Featured crafts retrieved successfully
 */
router.get('/featured',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  handleValidationErrors,
  craftsController.getFeaturedCrafts
);

/**
 * @swagger
 * /api/crafts/search:
 *   get:
 *     summary: Search crafts listings
 *     tags: [Crafts]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Search term is required
 */
router.get('/search',
  query('q').isString().isLength({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  craftsController.searchCrafts
);

/**
 * @swagger
 * /api/crafts/category/{category}:
 *   get:
 *     summary: Get crafts by category
 *     tags: [Crafts]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [artwork, furniture, accessories, home_decor, jewelry, bags_purses, clothing, toys, functional_items, other]
 *         description: Craft category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Category crafts retrieved successfully
 */
router.get('/category/:category',
  param('category').isIn(['artwork', 'furniture', 'accessories', 'home_decor', 'jewelry', 'bags_purses', 'clothing', 'toys', 'functional_items', 'other']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  craftsController.getCraftsByCategory
);

/**
 * @swagger
 * /api/crafts/{id}:
 *   get:
 *     summary: Get a specific crafts listing
 *     tags: [Crafts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Crafts listing ID
 *     responses:
 *       200:
 *         description: Crafts listing retrieved successfully
 *       404:
 *         description: Crafts listing not found
 */
router.get('/:id',
  param('id').isInt({ min: 1 }),
  handleValidationErrors,
  craftsController.getCraft
);

/**
 * @swagger
 * /api/crafts/{id}:
 *   put:
 *     summary: Update a crafts listing
 *     tags: [Crafts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Crafts listing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               craftMaterial:
 *                 type: string
 *                 enum: [recycled_plastic, upcycled_fabric, reclaimed_wood, recycled_metal, repurposed_glass, mixed_materials, other]
 *               craftCategory:
 *                 type: string
 *                 enum: [artwork, furniture, accessories, home_decor, jewelry, bags_purses, clothing, toys, functional_items, other]
 *               pricePerUnit:
 *                 type: number
 *               craftingTechnique:
 *                 type: string
 *               dimensions:
 *                 type: string
 *               careInstructions:
 *                 type: string
 *               isCustomizable:
 *                 type: boolean
 *               estimatedCraftingTime:
 *                 type: integer
 *               artistName:
 *                 type: string
 *               artistBio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Crafts listing updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Crafts listing not found or access denied
 */
router.put('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }),
  updateCraftsValidation,
  handleValidationErrors,
  craftsController.updateCraft
);

/**
 * @swagger
 * /api/crafts/{id}:
 *   delete:
 *     summary: Delete a crafts listing
 *     tags: [Crafts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Crafts listing ID
 *     responses:
 *       200:
 *         description: Crafts listing deleted successfully
 *       404:
 *         description: Crafts listing not found or access denied
 */
router.delete('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }),
  handleValidationErrors,
  craftsController.deleteCraft
);

/**
 * @swagger
 * /api/crafts/artist/{artistId}:
 *   get:
 *     summary: Get crafts by artist
 *     tags: [Crafts]
 *     parameters:
 *       - in: path
 *         name: artistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Artist/Business ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Artist crafts retrieved successfully
 */
router.get('/artist/:artistId',
  param('artistId').isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  craftsController.getCraftsByArtist
);

export default router;