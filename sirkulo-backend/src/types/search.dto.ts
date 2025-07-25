import { IsOptional, IsString, IsNumber, IsArray, IsEnum, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WasteType, ListingStatus } from './enums';

/**
 * Sort options for search results
 */
export enum SortBy {
  RELEVANCE = 'relevance',
  PRICE_LOW_HIGH = 'price_asc',
  PRICE_HIGH_LOW = 'price_desc',
  DATE_NEWEST = 'date_desc',
  DATE_OLDEST = 'date_asc',
  DISTANCE = 'distance',
  QUANTITY_LOW_HIGH = 'quantity_asc',
  QUANTITY_HIGH_LOW = 'quantity_desc',
  RATING = 'rating'
}

/**
 * Search and filter DTO for listings
 */
export class SearchListingsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(WasteType, { each: true })
  wasteTypes?: WasteType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ListingStatus, { each: true })
  status?: ListingStatus[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxQuantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isNegotiable?: boolean;

  @IsOptional()
  @IsString()
  location?: string;

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
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radiusKm?: number = 50;

  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasImages?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  certified?: boolean;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.RELEVANCE;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;
}

/**
 * Advanced filter options DTO
 */
export class AdvancedFilterDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessTypes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supplierIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minBusinessRating?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  verifiedSuppliers?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  bulkAvailable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minBulkQuantity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materials?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  sustainabilityCertified?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

/**
 * Search suggestions DTO
 */
export class SearchSuggestionsDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  limit?: number = 5;

  @IsOptional()
  @IsEnum(['listings', 'suppliers', 'locations', 'materials'])
  type?: 'listings' | 'suppliers' | 'locations' | 'materials';
}

/**
 * Search result response DTO
 */
export class SearchResultDto {
  id: number;
  title: string;
  description: string;
  wasteType: WasteType;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  isNegotiable: boolean;
  status: ListingStatus;
  location: {
    city: string;
    state: string;
    country: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
  };
  supplier: {
    id: number;
    businessName: string;
    rating: number;
    verified: boolean;
    memberSince: Date;
  };
  images: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  relevanceScore?: number;
}

/**
 * Search response with pagination
 */
export class SearchResponseDto {
  results: SearchResultDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    applied: any;
    available: {
      wasteTypes: { value: WasteType; count: number }[];
      priceRanges: { min: number; max: number; count: number }[];
      locations: { city: string; state: string; count: number }[];
      suppliers: { id: number; name: string; count: number }[];
    };
  };
  suggestions?: string[];
  executionTime: number;
}

/**
 * Facet response for filter aggregations
 */
export class FacetDto {
  field: string;
  values: Array<{
    value: string | number;
    count: number;
    selected?: boolean;
  }>;
}

/**
 * Saved search DTO
 */
export class SavedSearchDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => SearchListingsDto)
  searchParams: SearchListingsDto;

  @IsOptional()
  @IsBoolean()
  enableAlerts?: boolean = false;

  @IsOptional()
  @IsString()
  alertFrequency?: 'daily' | 'weekly' | 'monthly' = 'weekly';
}

/**
 * Search analytics DTO
 */
export class SearchAnalyticsDto {
  query: string;
  filters: any;
  resultsCount: number;
  clickedResults: number[];
  userId?: number;
  sessionId: string;
  timestamp: Date;
  executionTime: number;
  location?: {
    city: string;
    country: string;
  };
}