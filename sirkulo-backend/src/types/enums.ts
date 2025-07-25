/**
 * User roles and enums for the Sirkulo application
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
 * Listing categories
 */
export enum ListingCategory {
  WASTE = 'waste',
  PROJECT = 'project',
  CRAFTS = 'crafts',
  TEXTILES = 'textiles',
  ELECTRONICS = 'electronics',
  PLASTICS = 'plastics',
  METALS = 'metals',
  PAPER = 'paper',
  GLASS = 'glass',
  ORGANIC = 'organic',
  COMPOSITE = 'composite',
  OTHER = 'other',
}

/**
 * Condition of items
 */
export enum ItemCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
}

/**
 * Listing status
 */
export enum ListingStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SOLD = 'sold',
  ARCHIVED = 'archived',
}

/**
 * Order/Transaction status
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
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
  PAID = 'paid',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * Project difficulty levels
 */
export enum ProjectDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

/**
 * Project volunteer requirements
 */
export enum VolunteerRequirement {
  NO_EXPERIENCE = 'no_experience',
  BASIC_SKILLS = 'basic_skills',
  SPECIALIZED_SKILLS = 'specialized_skills',
  CERTIFICATION_REQUIRED = 'certification_required',
}

/**
 * Craft material types (for upcycled products)
 */
export enum CraftMaterial {
  RECYCLED_PLASTIC = 'recycled_plastic',
  UPCYCLED_FABRIC = 'upcycled_fabric',
  RECLAIMED_WOOD = 'reclaimed_wood',
  RECYCLED_METAL = 'recycled_metal',
  REPURPOSED_GLASS = 'repurposed_glass',
  MIXED_MATERIALS = 'mixed_materials',
  OTHER = 'other',
}

/**
 * Craft categories
 */
export enum CraftCategory {
  ARTWORK = 'artwork',
  FURNITURE = 'furniture',
  ACCESSORIES = 'accessories',
  HOME_DECOR = 'home_decor',
  JEWELRY = 'jewelry',
  BAGS_PURSES = 'bags_purses',
  CLOTHING = 'clothing',
  TOYS = 'toys',
  FUNCTIONAL_ITEMS = 'functional_items',
  OTHER = 'other',
}