import { IsOptional, IsString, IsArray, IsNumber, Min, Max } from 'class-validator';

/**
 * DTO for single image upload
 */
export class ImageUploadDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  displayOrder?: number;
}

/**
 * DTO for multiple image upload
 */
export class MultipleImageUploadDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  captions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  altTexts?: string[];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  displayOrders?: number[];
}

/**
 * DTO for image metadata update
 */
export class ImageMetadataDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  displayOrder?: number;
}

/**
 * Response DTO for uploaded image
 */
export interface ImageResponseDto {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  thumbnailUrl: string;
  caption?: string;
  altText?: string;
  displayOrder: number;
  metadata: {
    width?: number;
    height?: number;
    format?: string;
  };
  uploadedAt: Date;
}

/**
 * Response DTO for multiple image upload
 */
export interface MultipleImageResponseDto {
  images: ImageResponseDto[];
  uploaded: number;
  failed: number;
  errors?: string[];
}
