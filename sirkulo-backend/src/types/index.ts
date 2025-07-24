/**
 * Common types and interfaces used across the Sirkulo application
 */

/**
 * User roles in the system
 */
export enum UserRole {
  USER = 'user',
  RECYCLER = 'recycler',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

/**
 * User verification status
 */
export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

/**
 * Waste listing types
 */
export enum WasteType {
  FABRIC_SCRAPS = 'fabric_scraps',
  TEXTILE_WASTE = 'textile_waste',
  LEATHER_WASTE = 'leather_waste',
  BUTTONS_ZIPPERS = 'buttons_zippers',
  THREAD_YARN = 'thread_yarn',
  OTHER = 'other',
}

/**
 * Listing status
 */
export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  RESERVED = 'reserved',
  INACTIVE = 'inactive',
}

/**
 * Order/Transaction status
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Pickup status
 */
export enum PickupStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Bid status
 */
export enum BidStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

/**
 * Project status
 */
export enum ProjectStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Payment status
 */
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

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
