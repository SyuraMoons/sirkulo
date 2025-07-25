import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsArray, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../types';

/**
 * Data Transfer Object for user registration
 */
export class SignUpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phoneNumber?: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array' })
  @IsEnum(UserRole, { each: true, message: 'Invalid role specified' })
  roles?: UserRole[];

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid active mode specified' })
  activeMode?: UserRole;
}

/**
 * Data Transfer Object for user login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  password: string;
}

/**
 * Data Transfer Object for refresh token
 */
export class RefreshTokenDto {
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}

/**
 * Data Transfer Object for switching user mode
 */
export class SwitchModeDto {
  @IsEnum(UserRole, { message: 'Invalid mode specified' })
  mode: UserRole;
}

/**
 * Data Transfer Object for password reset request
 */
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

/**
 * Data Transfer Object for password reset
 */
export class ResetPasswordDto {
  @IsString({ message: 'Token must be a string' })
  token: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  newPassword: string;
}

/**
 * Data Transfer Object for updating user profile
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Please provide a valid phone number' })
  phoneNumber?: string;

  @IsOptional()
  businessProfile?: {
    companyName?: string;
    businessType?: string;
    registrationNumber?: string;
    address?: string;
    description?: string;
    website?: string;
  };

  @IsOptional()
  recyclerProfile?: {
    specialization?: string[];
    experience?: string;
    portfolio?: string[];
    certifications?: string[];
  };

  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
}
