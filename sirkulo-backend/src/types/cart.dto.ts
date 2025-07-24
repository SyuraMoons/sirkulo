import { IsNumber, IsString, IsOptional, Min, IsPositive } from 'class-validator';

/**
 * DTO for adding an item to the cart
 */
export class AddToCartDto {
  @IsNumber({}, { message: 'Listing ID must be a number' })
  @IsPositive({ message: 'Listing ID must be positive' })
  listingId: number;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

/**
 * DTO for updating cart item quantity
 */
export class UpdateCartItemDto {
  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

/**
 * Response DTO for cart items with listing details
 */
export interface CartItemResponseDto {
  id: number;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  listing: {
    id: number;
    title: string;
    wasteType: string;
    unit: string;
    availableQuantity: number;
    status: string;
    images: string[];
    business: {
      id: number;
      firstName: string;
      lastName: string;
      businessProfile?: {
        companyName?: string;
      };
    };
  };
}

/**
 * Response DTO for the entire cart
 */
export interface CartResponseDto {
  items: CartItemResponseDto[];
  summary: {
    totalItems: number;
    totalQuantity: number;
    subtotal: number;
    estimatedTotal: number;
  };
  metadata: {
    lastUpdated: Date;
    itemCount: number;
  };
}

/**
 * DTO for bulk operations on cart
 */
export class BulkCartOperationDto {
  @IsNumber({}, { each: true, message: 'Item IDs must be numbers' })
  itemIds: number[];
}
