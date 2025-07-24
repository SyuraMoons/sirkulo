import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Standard API response utility functions
 */
export class ResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
    meta?: any
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    message: string = 'Error occurred',
    statusCode: number = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(error && { error }),
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[] | string,
    message: string = 'Validation failed'
  ): Response {
    return res.status(400).json({
      success: false,
      message,
      error: Array.isArray(errors) ? errors.join(', ') : errors,
    });
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(
    res: Response,
    message: string = 'Unauthorized access'
  ): Response {
    return res.status(401).json({
      success: false,
      message,
      error: 'Authentication required',
    });
  }

  /**
   * Send forbidden response
   */
  static forbidden(
    res: Response,
    message: string = 'Access forbidden'
  ): Response {
    return res.status(403).json({
      success: false,
      message,
      error: 'Insufficient permissions',
    });
  }

  /**
   * Send not found response
   */
  static notFound(
    res: Response,
    message: string = 'Resource not found'
  ): Response {
    return res.status(404).json({
      success: false,
      message,
      error: 'The requested resource was not found',
    });
  }
}
