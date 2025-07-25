import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO for creating a new rating
 */
export class CreateRatingDto {
  @IsNumber()
  listingId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

/**
 * DTO for updating an existing rating
 */
export class UpdateRatingDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * DTO for rating search and filtering
 */
export class RatingSearchDto {
  @IsOptional()
  @IsNumber()
  listingId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'rating' | 'updatedAt';

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
 * Response DTO for rating
 */
export interface RatingResponseDto {
  id: number;
  rating: number;
  comment: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  listing: {
    id: number;
    title: string;
  };
}

/**
 * Response DTO for rating summary
 */
export interface RatingSummaryResponseDto {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

/**
 * Response DTO for listing rating statistics
 */
export interface ListingRatingStatsDto {
  listingId: number;
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

/**
 * Paginated response for ratings
 */
export interface PaginatedRatingsResponseDto {
  data: RatingSummaryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  stats?: ListingRatingStatsDto;
}