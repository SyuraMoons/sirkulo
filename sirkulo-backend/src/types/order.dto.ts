import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, ValidateNested, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentStatus } from './enums';

/**
 * DTO for shipping address
 */
export class ShippingAddressDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @IsString()
  postalCode!: string;

  @IsNotEmpty()
  @IsString()
  country!: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber!: string;
}

/**
 * DTO for creating an order from cart
 */
export class CreateOrderDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for updating order status
 */
export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;
}

/**
 * DTO for cancelling an order
 */
export class CancelOrderDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for order search and filtering
 */
export class OrderQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  buyerId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sellerId?: number;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount' = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Response DTO for order item
 */
export class OrderItemResponseDto {
  id!: number;
  listing!: {
    id: number;
    title: string;
    description?: string;
    wasteType: string;
    unit: string;
    images: string[];
  };
  quantity!: number;
  pricePerUnit!: number;
  totalPrice!: number;
  business!: {
    id: number;
    firstName: string;
    lastName: string;
    businessProfile: {
      companyName: string;
      businessType: string;
      description?: string;
    };
  };
  specifications?: Record<string, any>;
  notes?: string;
  createdAt!: Date;
}

/**
 * Response DTO for order
 */
export class OrderResponseDto {
  id!: number;
  orderNumber!: string;
  status!: OrderStatus;
  statusDisplay!: string;
  paymentStatus!: PaymentStatus;
  buyer!: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    businessProfile?: any;
    recyclerProfile?: any;
  };
  seller!: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    businessProfile?: any;
  };
  items!: OrderItemResponseDto[];
  financials!: {
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    totalAmount: number;
  };
  shipping!: {
    address?: any;
    method?: string;
    trackingNumber?: string;
  };
  dates!: {
    createdAt: Date;
    confirmedAt?: Date;
    shippedAt?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
  };
  notes?: string;
  cancellationReason?: string;
  canBeCancelled!: boolean;
  canBeModified!: boolean;
}

/**
 * Response DTO for paginated orders
 */
export class OrderListResponseDto {
  orders!: OrderResponseDto[];
  meta!: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Response DTO for order statistics
 */
export class OrderStatsResponseDto {
  totalOrders!: number;
  pendingOrders!: number;
  confirmedOrders!: number;
  shippedOrders!: number;
  deliveredOrders!: number;
  cancelledOrders!: number;
  totalRevenue!: number;
  averageOrderValue!: number;
}
