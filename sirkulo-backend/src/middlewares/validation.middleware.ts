import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ResponseUtil } from '../utils/response.util';
import { validationResult } from 'express-validator';

/**
 * Validation middleware factory
 * @param dtoClass - The DTO class to validate against
 * @param property - Which property of the request to validate ('body', 'query', 'params')
 */
export const validateDto = (
  dtoClass: any,
  property: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Transform plain object to class instance
      const dto = plainToClass(dtoClass, req[property]);
      
      // Validate the DTO
      const errors: ValidationError[] = await validate(dto);
      
      if (errors.length > 0) {
        // Extract error messages
        const errorMessages = errors.map(error => {
          const constraints = error.constraints;
          return constraints ? Object.values(constraints) : ['Validation failed'];
        }).flat();
        
        ResponseUtil.validationError(res, errorMessages);
        return;
      }
      
      // Replace the request property with the validated DTO
      req[property] = dto;
      next();
    } catch (error) {
      ResponseUtil.error(res, 'Validation error occurred', 400);
      return;
    }
  };
};

/**
 * Custom validation middleware for specific validation logic
 */
export const customValidation = (
  validationFn: (req: Request) => Promise<string[] | null>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const errors = await validationFn(req);
      
      if (errors && errors.length > 0) {
        ResponseUtil.validationError(res, errors);
        return;
      }
      
      next();
    } catch (error) {
      ResponseUtil.error(res, 'Validation error occurred', 400);
      return;
    }
  };
};

/**
 * Express-validator middleware to handle validation results
 * Works with express-validator validation chains
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    ResponseUtil.validationError(res, errorMessages);
    return;
  }
  
  next();
};