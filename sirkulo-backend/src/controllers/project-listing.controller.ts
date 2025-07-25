import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Listing } from '../models/listing.model';
import { User } from '../models/user.model';
import { 
  CreateProjectListingDto, 
  UpdateProjectListingDto, 
  ProjectListingFiltersDto,
  ApplyVolunteerDto 
} from '../dto/listing-extended.dto';
import { ListingCategory, UserRole, ListingStatus } from '../types';

/**
 * Controller for Project Listings
 * Handles recycling projects that businesses post for volunteers
 */
export class ProjectListingController {
  private listingRepository: Repository<Listing>;
  private userRepository: Repository<User>;

  constructor() {
    this.listingRepository = AppDataSource.getRepository(Listing);
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Create a new project listing
   * Only businesses can create project listings
   */
  public createProject = async (req: Request, res: Response): Promise<void> => {
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

      // Check if user is a business
      if (!user.roles.includes(UserRole.BUSINESS)) {
        res.status(403).json({
          success: false,
          message: 'Only businesses can create project listings',
        });
        return;
      }

      // Validate DTO
      const createProjectDto = plainToClass(CreateProjectListingDto, req.body);
      const errors = await validate(createProjectDto);

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

      // Create project listing
      const projectListing = this.listingRepository.create({
        ...createProjectDto,
        category: ListingCategory.PROJECT,
        businessId: userId,
        volunteersApplied: 0,
        projectStartDate: new Date(createProjectDto.projectStartDate),
        projectEndDate: createProjectDto.projectEndDate ? new Date(createProjectDto.projectEndDate) : null,
      });

      // Validate project-specific fields
      const validationErrors = projectListing.validateListingType();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Project validation failed',
          errors: validationErrors,
        });
        return;
      }

      const savedListing = await this.listingRepository.save(projectListing);

      // Load the complete listing with business details
      const completeListing = await this.listingRepository.findOne({
        where: { id: savedListing.id },
        relations: ['business'],
      });

      res.status(201).json({
        success: true,
        message: 'Project listing created successfully',
        data: {
          listing: {
            ...completeListing?.toSummary(),
            isAcceptingVolunteers: completeListing?.isAcceptingVolunteers(),
          },
        },
      });
    } catch (error) {
      console.error('Error creating project listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get all project listings with filters
   */
  public getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      // Validate filters
      const filtersDto = plainToClass(ProjectListingFiltersDto, req.query);
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
        .where('listing.category = :category', { category: ListingCategory.PROJECT })
        .andWhere('listing.isActive = :isActive', { isActive: true });

      // Apply filters
      if (filtersDto.difficulty) {
        queryBuilder.andWhere('listing.projectDifficulty = :difficulty', { 
          difficulty: filtersDto.difficulty 
        });
      }

      if (filtersDto.volunteerRequirement) {
        queryBuilder.andWhere('listing.volunteerRequirement = :requirement', { 
          requirement: filtersDto.volunteerRequirement 
        });
      }

      if (filtersDto.isRemote !== undefined) {
        queryBuilder.andWhere('listing.projectLocation->>\'isRemote\' = :isRemote', { 
          isRemote: filtersDto.isRemote.toString() 
        });
      }

      if (filtersDto.startDateFrom) {
        queryBuilder.andWhere('listing.projectStartDate >= :startDateFrom', { 
          startDateFrom: new Date(filtersDto.startDateFrom) 
        });
      }

      if (filtersDto.startDateTo) {
        queryBuilder.andWhere('listing.projectStartDate <= :startDateTo', { 
          startDateTo: new Date(filtersDto.startDateTo) 
        });
      }

      if (filtersDto.volunteersNeeded) {
        queryBuilder.andWhere('listing.volunteersNeeded >= :volunteersNeeded', { 
          volunteersNeeded: filtersDto.volunteersNeeded 
        });
      }

      if (filtersDto.acceptingVolunteers) {
        queryBuilder.andWhere('listing.status = :status', { status: ListingStatus.ACTIVE });
        queryBuilder.andWhere('listing.volunteersApplied < listing.volunteersNeeded');
        queryBuilder.andWhere('listing.projectStartDate > :now', { now: new Date() });
      }

      // Apply sorting
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      if (sortBy === 'projectStartDate') {
        queryBuilder.orderBy('listing.projectStartDate', sortOrder);
      } else if (sortBy === 'volunteersNeeded') {
        queryBuilder.orderBy('listing.volunteersNeeded', sortOrder);
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

      const projectListings = listings.map(listing => ({
        ...listing.toSummary(),
        isAcceptingVolunteers: listing.isAcceptingVolunteers(),
      }));

      res.status(200).json({
        success: true,
        message: 'Project listings retrieved successfully',
        data: {
          listings: projectListings,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting project listings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get a specific project listing
   */
  public getProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.PROJECT,
          isActive: true 
        },
        relations: ['business', 'imageEntities'],
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Project listing not found',
        });
        return;
      }

      // Increment view count
      listing.incrementViewCount();
      await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Project listing retrieved successfully',
        data: {
          listing: {
            ...listing.toSummary(),
            isAcceptingVolunteers: listing.isAcceptingVolunteers(),
            targetAudience: listing.getTargetAudience(),
          },
        },
      });
    } catch (error) {
      console.error('Error getting project listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Update a project listing
   */
  public updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.PROJECT,
          businessId: userId 
        },
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Project listing not found or access denied',
        });
        return;
      }

      // Validate DTO
      const updateProjectDto = plainToClass(UpdateProjectListingDto, req.body);
      const errors = await validate(updateProjectDto);

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
      Object.assign(listing, updateProjectDto);

      if (updateProjectDto.projectStartDate) {
        listing.projectStartDate = new Date(updateProjectDto.projectStartDate);
      }

      if (updateProjectDto.projectEndDate) {
        listing.projectEndDate = new Date(updateProjectDto.projectEndDate);
      }

      // Validate updated listing
      const validationErrors = listing.validateListingType();
      if (validationErrors.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Project validation failed',
          errors: validationErrors,
        });
        return;
      }

      const savedListing = await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Project listing updated successfully',
        data: {
          listing: {
            ...savedListing.toSummary(),
            isAcceptingVolunteers: savedListing.isAcceptingVolunteers(),
          },
        },
      });
    } catch (error) {
      console.error('Error updating project listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Apply to volunteer for a project
   */
  public applyForVolunteer = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      // Check if user is a recycler
      if (!user.roles.includes(UserRole.RECYCLER)) {
        res.status(403).json({
          success: false,
          message: 'Only recyclers can apply for volunteer positions',
        });
        return;
      }

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.PROJECT,
          isActive: true 
        },
        relations: ['business'],
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Project listing not found',
        });
        return;
      }

      if (!listing.isAcceptingVolunteers()) {
        res.status(400).json({
          success: false,
          message: 'This project is not currently accepting volunteers',
        });
        return;
      }

      // Validate application DTO
      const applicationDto = plainToClass(ApplyVolunteerDto, req.body);
      const errors = await validate(applicationDto);

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

      // Apply for volunteer position
      listing.applyForVolunteer();
      await this.listingRepository.save(listing);

      // Here you would typically create a volunteer application record
      // and send notifications to the business owner

      res.status(200).json({
        success: true,
        message: 'Volunteer application submitted successfully',
        data: {
          listing: {
            ...listing.toSummary(),
            isAcceptingVolunteers: listing.isAcceptingVolunteers(),
          },
        },
      });
    } catch (error) {
      console.error('Error applying for volunteer position:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Delete a project listing
   */
  public deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const listingId = parseInt(req.params.id);
      const userId = (req as any).user.userId;

      const listing = await this.listingRepository.findOne({
        where: { 
          id: listingId, 
          category: ListingCategory.PROJECT,
          businessId: userId 
        },
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: 'Project listing not found or access denied',
        });
        return;
      }

      // Soft delete
      listing.isActive = false;
      listing.status = ListingStatus.ARCHIVED;
      await this.listingRepository.save(listing);

      res.status(200).json({
        success: true,
        message: 'Project listing deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting project listing:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };

  /**
   * Get projects by business
   */
  public getProjectsByBusiness = async (req: Request, res: Response): Promise<void> => {
    try {
      const businessId = parseInt(req.params.businessId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;

      const [listings, totalCount] = await this.listingRepository.findAndCount({
        where: { 
          businessId, 
          category: ListingCategory.PROJECT,
          isActive: true 
        },
        relations: ['business'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const projectListings = listings.map(listing => ({
        ...listing.toSummary(),
        isAcceptingVolunteers: listing.isAcceptingVolunteers(),
      }));

      res.status(200).json({
        success: true,
        message: 'Business project listings retrieved successfully',
        data: {
          listings: projectListings,
          pagination: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error getting business project listings:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  };
}