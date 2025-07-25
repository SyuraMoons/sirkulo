import express from 'express';
import { ProjectListingController } from '../controllers/project-listing.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();
const projectController = new ProjectListingController();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Create project validation
const createProjectValidation = [
  body('title')
    .isString()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .isString()
    .isLength({ min: 20, max: 2000 })
    .withMessage('Description must be between 20 and 2000 characters'),
  body('projectDifficulty')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid project difficulty'),
  body('volunteerRequirement')
    .isIn(['no_experience', 'basic_skills', 'specialized_skills', 'certification_required'])
    .withMessage('Invalid volunteer requirement'),
  body('volunteersNeeded')
    .isInt({ min: 1, max: 100 })
    .withMessage('Volunteers needed must be between 1 and 100'),
  body('projectStartDate')
    .isISO8601()
    .withMessage('Invalid project start date'),
  body('projectEndDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid project end date'),
  body('expectedOutcome')
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Expected outcome must be between 10 and 500 characters'),
  body('location')
    .isObject()
    .withMessage('Location is required'),
  body('location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),
  body('projectLocation')
    .optional()
    .isObject()
    .withMessage('Project location must be an object'),
  body('projectLocation.isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean'),
];

// Update project validation
const updateProjectValidation = [
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
  body('projectDifficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid project difficulty'),
  body('volunteerRequirement')
    .optional()
    .isIn(['no_experience', 'basic_skills', 'specialized_skills', 'certification_required'])
    .withMessage('Invalid volunteer requirement'),
  body('volunteersNeeded')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Volunteers needed must be between 1 and 100'),
  body('projectStartDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid project start date'),
  body('projectEndDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid project end date'),
  body('expectedOutcome')
    .optional()
    .isString()
    .isLength({ min: 10, max: 500 })
    .withMessage('Expected outcome must be between 10 and 500 characters'),
];

// Volunteer application validation
const volunteerApplicationValidation = [
  body('message')
    .isString()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
  body('experience')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Experience must be at most 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .isString()
    .withMessage('Each skill must be a string'),
  body('availability')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Availability must be at most 200 characters'),
];

// Filter validation
const projectFiltersValidation = [
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid difficulty filter'),
  query('volunteerRequirement')
    .optional()
    .isIn(['no_experience', 'basic_skills', 'specialized_skills', 'certification_required'])
    .withMessage('Invalid volunteer requirement filter'),
  query('isRemote')
    .optional()
    .isBoolean()
    .withMessage('isRemote must be a boolean'),
  query('startDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date from'),
  query('startDateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date to'),
  query('volunteersNeeded')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Volunteers needed must be a positive integer'),
  query('acceptingVolunteers')
    .optional()
    .isBoolean()
    .withMessage('acceptingVolunteers must be a boolean'),
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
    .isIn(['createdAt', 'projectStartDate', 'volunteersNeeded', 'title'])
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
 *     CreateProjectRequest:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - projectDifficulty
 *         - volunteerRequirement
 *         - volunteersNeeded
 *         - projectStartDate
 *         - expectedOutcome
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
 *         projectDifficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         volunteerRequirement:
 *           type: string
 *           enum: [no_experience, basic_skills, specialized_skills, certification_required]
 *         volunteersNeeded:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         projectStartDate:
 *           type: string
 *           format: date-time
 *         projectEndDate:
 *           type: string
 *           format: date-time
 *         expectedOutcome:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
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
 *         projectLocation:
 *           type: object
 *           properties:
 *             isRemote:
 *               type: boolean
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project listing
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Only businesses can create projects
 */
router.post('/',
  authenticateToken,
  createProjectValidation,
  handleValidationErrors,
  projectController.createProject
);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all project listings
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced, expert]
 *         description: Filter by project difficulty
 *       - in: query
 *         name: volunteerRequirement
 *         schema:
 *           type: string
 *           enum: [no_experience, basic_skills, specialized_skills, certification_required]
 *         description: Filter by volunteer requirement
 *       - in: query
 *         name: isRemote
 *         schema:
 *           type: boolean
 *         description: Filter by remote projects
 *       - in: query
 *         name: acceptingVolunteers
 *         schema:
 *           type: boolean
 *         description: Filter projects accepting volunteers
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
 *           enum: [createdAt, projectStartDate, volunteersNeeded, title]
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *       400:
 *         description: Invalid filter parameters
 */
router.get('/',
  projectFiltersValidation,
  handleValidationErrors,
  projectController.getProjects
);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a specific project listing
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get('/:id',
  param('id').isInt({ min: 1 }),
  handleValidationErrors,
  projectController.getProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project listing
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
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
 *               projectDifficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced, expert]
 *               volunteerRequirement:
 *                 type: string
 *                 enum: [no_experience, basic_skills, specialized_skills, certification_required]
 *               volunteersNeeded:
 *                 type: integer
 *               projectStartDate:
 *                 type: string
 *                 format: date-time
 *               projectEndDate:
 *                 type: string
 *                 format: date-time
 *               expectedOutcome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Project not found or access denied
 */
router.put('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }),
  updateProjectValidation,
  handleValidationErrors,
  projectController.updateProject
);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project listing
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found or access denied
 */
router.delete('/:id',
  authenticateToken,
  param('id').isInt({ min: 1 }),
  handleValidationErrors,
  projectController.deleteProject
);

/**
 * @swagger
 * /api/projects/{id}/volunteer:
 *   post:
 *     summary: Apply to volunteer for a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               experience:
 *                 type: string
 *                 maxLength: 500
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               availability:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Volunteer application submitted successfully
 *       400:
 *         description: Validation error or project not accepting volunteers
 *       403:
 *         description: Only recyclers can apply for volunteer positions
 *       404:
 *         description: Project not found
 */
router.post('/:id/volunteer',
  authenticateToken,
  param('id').isInt({ min: 1 }),
  volunteerApplicationValidation,
  handleValidationErrors,
  projectController.applyForVolunteer
);

/**
 * @swagger
 * /api/projects/business/{businessId}:
 *   get:
 *     summary: Get projects by business
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Business ID
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
 *         description: Business projects retrieved successfully
 */
router.get('/business/:businessId',
  param('businessId').isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
  projectController.getProjectsByBusiness
);

export default router;