import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import config from './index';

/**
 * Upload configuration for Sirkulo marketplace
 */

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
];

// File size limits (in bytes)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_UPLOAD = 10;

// Image processing dimensions
export const IMAGE_DIMENSIONS = {
  thumbnail: { width: 200, height: 200 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 900 }
};

/**
 * Multer storage configuration
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads', 'images');
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

/**
 * File filter for image validation
 */
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file type is allowed
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`));
  }
};

/**
 * Multer upload configuration
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_PER_UPLOAD
  }
});

/**
 * Upload middleware configurations
 */
export const uploadMiddleware = {
  // Single image upload
  single: (fieldName: string = 'image') => upload.single(fieldName),
  
  // Multiple images upload
  multiple: (fieldName: string = 'images', maxCount: number = MAX_FILES_PER_UPLOAD) => 
    upload.array(fieldName, maxCount),
  
  // Mixed fields upload (for future use)
  fields: (fields: { name: string; maxCount: number }[]) => upload.fields(fields)
};

/**
 * File path utilities
 */
export const getImagePath = (filename: string, type: 'original' | 'thumbnail' = 'original'): string => {
  const basePath = type === 'thumbnail' ? 'uploads/thumbnails' : 'uploads/images';
  return path.join(process.cwd(), basePath, filename);
};

/**
 * URL generation utilities
 */
export const getImageUrl = (filename: string, type: 'original' | 'thumbnail' = 'original'): string => {
  const baseUrl = config.baseUrl || `http://localhost:${config.port}`;
  const endpoint = type === 'thumbnail' ? '/api/uploads/thumbnail' : '/api/uploads/image';
  return `${baseUrl}${endpoint}/${filename}`;
};

/**
 * File validation utilities
 */
export const validateImageFile = (file: Express.Multer.File): { isValid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }

  return { isValid: true };
};
