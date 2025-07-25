/**
 * Common types and interfaces used across the Sirkulo application
 */

// Export all enums
export * from './enums';

// Export all DTOs
export * from './auth.dto';
export * from './listing.dto';
export * from './cart.dto';
export * from './order.dto';
export * from './upload.dto';

// Import enums for use in interfaces
import { UserRole, WasteType } from './enums';

/**
 * Geographic coordinates
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter parameters for listings
 */
export interface ListingFilters {
  type?: WasteType;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in kilometers
  };
  businessId?: number;
}

/**
 * JWT Payload interface
 */
export interface JwtPayload {
  userId: number;
  email: string;
  roles: UserRole[];
  activeMode: UserRole;
  iat?: number;
  exp?: number;
}

/**
 * File upload interface
 */
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export * from './payment.dto';
export * from './email.dto';

// Notification DTOs
export * from './notification.dto';