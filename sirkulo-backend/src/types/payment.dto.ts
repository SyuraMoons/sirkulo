/**
 * Payment-related DTOs for Xendit integration
 */

import { IsString, IsNumber, IsEmail, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Payment methods supported by Xendit
 */
export enum XenditPaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  EWALLET = 'EWALLET',
  RETAIL_OUTLET = 'RETAIL_OUTLET',
  CREDIT_CARD = 'CREDIT_CARD',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT'
}

/**
 * Bank codes supported by Xendit
 */
export enum XenditBankCode {
  BCA = 'BCA',
  BNI = 'BNI',
  BRI = 'BRI',
  MANDIRI = 'MANDIRI',
  PERMATA = 'PERMATA',
  BSI = 'BSI'
}

/**
 * E-wallet types supported by Xendit
 */
export enum XenditEwalletType {
  OVO = 'OVO',
  DANA = 'DANA',
  LINKAJA = 'LINKAJA',
  SHOPEEPAY = 'SHOPEEPAY',
  GOPAY = 'GOPAY'
}

/**
 * Payment status from Xendit
 */
export enum XenditPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

/**
 * Invoice status from Xendit
 */
export enum XenditInvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SETTLED = 'SETTLED',
  EXPIRED = 'EXPIRED'
}

/**
 * Customer information for payment
 */
export class CustomerInfoDto {
  @IsString()
  givenNames: string;

  @IsString()
  @IsOptional()
  surname?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  mobileNumber?: string;
}

/**
 * Address information
 */
export class AddressDto {
  @IsString()
  country: string;

  @IsString()
  streetLine1: string;

  @IsString()
  @IsOptional()
  streetLine2?: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsString()
  @IsOptional()
  postalCode?: string;
}

/**
 * Invoice item information
 */
export class InvoiceItemDto {
  @IsString()
  name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  url?: string;
}

/**
 * Create invoice DTO
 */
export class CreateInvoiceDto {
  @IsNumber()
  amount: number;

  @IsString()
  description: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @IsString()
  @IsOptional()
  paymentMethods?: string[];

  @IsString()
  @IsOptional()
  currency?: string = 'IDR';

  @IsNumber()
  @IsOptional()
  invoiceDuration?: number = 86400; // 24 hours

  @IsString()
  @IsOptional()
  successRedirectUrl?: string;

  @IsString()
  @IsOptional()
  failureRedirectUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  @IsOptional()
  items?: InvoiceItemDto[];

  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  customerAddress?: AddressDto;
}

/**
 * Create payment DTO
 */
export class CreatePaymentDto {
  @IsNumber()
  orderId: number;

  @IsEnum(XenditPaymentMethod)
  paymentMethod: XenditPaymentMethod;

  @IsString()
  @IsOptional()
  bankCode?: XenditBankCode;

  @IsString()
  @IsOptional()
  ewalletType?: XenditEwalletType;

  @IsString()
  @IsOptional()
  retailOutletName?: string;

  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @IsString()
  @IsOptional()
  successRedirectUrl?: string;

  @IsString()
  @IsOptional()
  failureRedirectUrl?: string;
}

/**
 * Xendit webhook payload DTO
 */
export class XenditWebhookDto {
  @IsString()
  id: string;

  @IsString()
  external_id: string;

  @IsString()
  status: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  paid_amount?: string;

  @IsDateString()
  @IsOptional()
  paid_at?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  payment_channel?: string;

  @IsString()
  @IsOptional()
  payment_destination?: string;

  @IsString()
  @IsOptional()
  bank_code?: string;

  @IsString()
  @IsOptional()
  merchant_name?: string;

  @IsDateString()
  created: string;

  @IsDateString()
  updated: string;

  @IsString()
  currency: string;

  @IsString()
  @IsOptional()
  payment_id?: string;

  @IsString()
  @IsOptional()
  failure_code?: string;
}

/**
 * Refund request DTO
 */
export class CreateRefundDto {
  @IsString()
  paymentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

/**
 * Payment query DTO
 */
export class PaymentQueryDto {
  @IsNumber()
  @IsOptional()
  orderId?: number;

  @IsEnum(XenditPaymentStatus)
  @IsOptional()
  status?: XenditPaymentStatus;

  @IsEnum(XenditPaymentMethod)
  @IsOptional()
  paymentMethod?: XenditPaymentMethod;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Payment response DTO
 */
export class PaymentResponseDto {
  id: string;
  orderId: number;
  xenditInvoiceId?: string;
  xenditPaymentId?: string;
  amount: number;
  status: XenditPaymentStatus;
  paymentMethod: XenditPaymentMethod;
  paymentUrl?: string;
  qrString?: string;
  virtualAccountNumber?: string;
  retailOutletCode?: string;
  expiryDate?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Refund response DTO
 */
export class RefundResponseDto {
  id: string;
  paymentId: string;
  xenditRefundId: string;
  amount: number;
  reason: string;
  status: string;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}