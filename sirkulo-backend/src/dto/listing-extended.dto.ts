import { IsEnum, IsOptional, IsString, IsNumber, IsBoolean, IsDateString, IsObject, Min, Max } from 'class-validator';

import { 
  ListingCategory, 
  ProjectDifficulty, 
  VolunteerRequirement, 
  CraftMaterial, 
  CraftCategory,
  WasteType,
  ListingStatus 
} from '../types/enums';

/**
 * Base listing DTO with common fields
 */
export class BaseListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsOptional()
  @IsEnum(WasteType)
  wasteType?: WasteType;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsString()
  unit: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerUnit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsObject()
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  @IsOptional()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsObject()
  specifications?: {
    color?: string;
    material?: string;
    condition?: string;
    origin?: string;
    additionalInfo?: Record<string, any>;
  };

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;
}

/**
 * Project listing creation DTO
 */
export class CreateProjectListingDto extends BaseListingDto {
  @IsEnum(ListingCategory)
  category: ListingCategory.PROJECT;

  @IsEnum(ProjectDifficulty)
  projectDifficulty: ProjectDifficulty;

  @IsEnum(VolunteerRequirement)
  volunteerRequirement: VolunteerRequirement;

  @IsNumber()
  @Min(1)
  @Max(100)
  volunteersNeeded: number;

  @IsDateString()
  projectStartDate: string;

  @IsOptional()
  @IsDateString()
  projectEndDate?: string;

  @IsOptional()
  @IsString()
  projectRequirements?: string;

  @IsString()
  expectedOutcome: string;

  @IsOptional()
  @IsObject()
  projectLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  };
}

/**
 * Crafts listing creation DTO
 */
export class CreateCraftsListingDto extends BaseListingDto {
  @IsEnum(ListingCategory)
  category: ListingCategory.CRAFTS;

  @IsEnum(CraftMaterial)
  craftMaterial: CraftMaterial;

  @IsEnum(CraftCategory)
  craftCategory: CraftCategory;

  @IsOptional()
  @IsString()
  craftingTechnique?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  careInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedCraftingTime?: number;

  @IsOptional()
  @IsString()
  artistName?: string;

  @IsOptional()
  @IsString()
  artistBio?: string;

  @IsNumber()
  @Min(0.01)
  pricePerUnit: number;
}

/**
 * Waste listing creation DTO (updated)
 */
export class CreateWasteListingDto extends BaseListingDto {
  @IsEnum(ListingCategory)
  category: ListingCategory.WASTE;

  @IsEnum(WasteType)
  wasteType: WasteType;

  @IsNumber()
  @Min(0.01)
  quantity: number;
}

/**
 * Update listing DTOs
 */
export class UpdateProjectListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectDifficulty)
  projectDifficulty?: ProjectDifficulty;

  @IsOptional()
  @IsEnum(VolunteerRequirement)
  volunteerRequirement?: VolunteerRequirement;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  volunteersNeeded?: number;

  @IsOptional()
  @IsDateString()
  projectStartDate?: string;

  @IsOptional()
  @IsDateString()
  projectEndDate?: string;

  @IsOptional()
  @IsString()
  projectRequirements?: string;

  @IsOptional()
  @IsString()
  expectedOutcome?: string;

  @IsOptional()
  @IsObject()
  projectLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  };

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

export class UpdateCraftsListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CraftMaterial)
  craftMaterial?: CraftMaterial;

  @IsOptional()
  @IsEnum(CraftCategory)
  craftCategory?: CraftCategory;

  @IsOptional()
  @IsString()
  craftingTechnique?: string;

  @IsOptional()
  @IsString()
  dimensions?: string;

  @IsOptional()
  @IsString()
  careInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedCraftingTime?: number;

  @IsOptional()
  @IsString()
  artistName?: string;

  @IsOptional()
  @IsString()
  artistBio?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  pricePerUnit?: number;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}

/**
 * Project volunteer application DTO
 */
export class ApplyVolunteerDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  availability?: string;
}

/**
 * Listing filter DTOs
 */
export class ProjectListingFiltersDto {
  @IsOptional()
  @IsEnum(ProjectDifficulty)
  difficulty?: ProjectDifficulty;

  @IsOptional()
  @IsEnum(VolunteerRequirement)
  volunteerRequirement?: VolunteerRequirement;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  volunteersNeeded?: number;

  @IsOptional()
  @IsBoolean()
  acceptingVolunteers?: boolean;
}

export class CraftsListingFiltersDto {
  @IsOptional()
  @IsEnum(CraftMaterial)
  material?: CraftMaterial;

  @IsOptional()
  @IsEnum(CraftCategory)
  category?: CraftCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsBoolean()
  isCustomizable?: boolean;

  @IsOptional()
  @IsString()
  artistName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxCraftingTime?: number;
}

/**
 * Response DTOs
 */
export class ProjectListingResponseDto {
  id: number;
  title: string;
  description: string;
  category: ListingCategory.PROJECT;
  projectDifficulty: ProjectDifficulty;
  volunteerRequirement: VolunteerRequirement;
  volunteersNeeded: number;
  volunteersApplied: number;
  projectStartDate: Date;
  projectEndDate?: Date;
  projectRequirements?: string;
  expectedOutcome: string;
  projectLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    isRemote: boolean;
  };
  status: ListingStatus;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  business: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile?: any;
  };
  createdAt: Date;
  updatedAt: Date;
  isAcceptingVolunteers: boolean;
}

export class CraftsListingResponseDto {
  id: number;
  title: string;
  description: string;
  category: ListingCategory.CRAFTS;
  craftMaterial: CraftMaterial;
  craftCategory: CraftCategory;
  craftingTechnique?: string;
  dimensions?: string;
  careInstructions?: string;
  isCustomizable: boolean;
  estimatedCraftingTime?: number;
  artistName?: string;
  artistBio?: string;
  pricePerUnit: number;
  totalPrice?: number;
  quantity: number;
  unit: string;
  status: ListingStatus;
  images: string[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  business: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile?: any;
  };
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
  isAvailableForPurchase: boolean;
}