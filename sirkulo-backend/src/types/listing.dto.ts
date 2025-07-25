import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { WasteType, ListingStatus } from '../types';

/**
 * Location DTO for listings
 */
export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  country: string;

  @IsString()
  postalCode: string;
}

/**
 * Specifications DTO for listings
 */
export class SpecificationsDto {
  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  material?: string;

  @IsOptional()
  @IsString()
  condition?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  additionalInfo?: Record<string, any>;
}

/**
 * DTO for creating a new listing
 */
export class CreateListingDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(WasteType)
  wasteType: WasteType | null;

  @IsNumber()
  @Min(0.01)
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

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications?: SpecificationsDto;

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
 * DTO for updating a listing
 */
export class UpdateListingDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(WasteType)
  wasteType?: WasteType | null;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

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

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecificationsDto)
  specifications?: SpecificationsDto;

  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsDateString()
  availableUntil?: string;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for listing search and filtering
 */
export class ListingSearchDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(WasteType)
  wasteType?: WasteType | null;

  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxQuantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  radius?: number; // in kilometers

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'price' | 'quantity' | 'distance' | 'rating';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

/**
 * Response DTO for listing creation/update
 */
export interface ListingResponseDto {
  id: number;
  title: string;
  description: string;
  wasteType: WasteType | null;
  quantity: number;
  unit: string;
  pricePerUnit: number | null;
  totalPrice: number | null;
  isNegotiable: boolean;
  status: ListingStatus;
  location: LocationDto;
  images: string[];
  specifications: SpecificationsDto | null;
  availableFrom: Date | null;
  availableUntil: Date | null;
  pickupInstructions: string | null;
  isActive: boolean;
  viewCount: number;
  inquiryCount: number;
  averageRating: number;
  totalRatings: number;
  business: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Response DTO for listing list (summary)
 */
export interface ListingSummaryResponseDto {
  id: number;
  title: string;
  wasteType: WasteType | null;
  quantity: number;
  unit: string;
  pricePerUnit: number | null;
  totalPrice: number | null;
  isNegotiable: boolean;
  status: ListingStatus;
  location: {
    city: string;
    state: string;
    country: string;
  };
  images: string[];
  averageRating: number;
  totalRatings: number;
  createdAt: Date;
  business: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile: any;
  } | null;
}

/**
 * Paginated response for listings
 */
export interface PaginatedListingsResponseDto {
  data: ListingSummaryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}