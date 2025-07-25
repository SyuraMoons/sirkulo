import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { ResponseUtil } from '../utils/response.util';

/**
 * Enhanced security middleware
 */

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  // Recursively sanitize all string inputs
  const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
      // Remove potentially dangerous characters
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, '') // Remove event handlers
        .trim();
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (typeof value === 'object' && value !== null) {
      const sanitized: any = {};
      for (const key in value) {
        sanitized[key] = sanitizeValue(value[key]);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  return next();
};

/**
 * SQL injection protection
 */
export const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /(\b(OR|AND)\s+['"]\d+['"])/i,
    /(--|\/\*|\*\/)/,
    /(\b(CHAR|VARCHAR|NCHAR|NVARCHAR)\s*\(\s*\d+\s*\))/i
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    } else if (Array.isArray(value)) {
      return value.some(checkValue);
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const inputs = [req.body, req.query, req.params].filter(Boolean);
  
  if (inputs.some(checkValue)) {
    return ResponseUtil.error(res, 'Invalid input detected. Please check your request.', 400);
  }

  return next();
};

/**
 * XSS protection
 */
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi
  ];

  const checkValue = (value: any): boolean => {
    if (typeof value === 'string') {
      return xssPatterns.some(pattern => pattern.test(value));
    } else if (Array.isArray(value)) {
      return value.some(checkValue);
    } else if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(checkValue);
    }
    return false;
  };

  const inputs = [req.body, req.query, req.params].filter(Boolean);
  
  if (inputs.some(checkValue)) {
    return ResponseUtil.error(res, 'Potentially malicious content detected.', 400);
  }

  return next();
};

/**
 * Request size validation
 */
export const validateRequestSize = (maxSizeBytes: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    
    if (contentLength > maxSizeBytes) {
      return ResponseUtil.error(res, 'Request entity too large.', 413);
    }

    return next();
  };
};

/**
 * Request frequency validation per IP
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const requestFrequencyCheck = (maxRequests: number = 1000, windowMs: number = 60000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxRequests) {
      return ResponseUtil.error(res, 'Too many requests from this IP.', 429);
    }
    
    record.count++;
    return next();
  };
};

/**
 * Header validation
 */
export const validateHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-host',
    'x-original-url',
    'x-rewrite-url'
  ];

  for (const header of suspiciousHeaders) {
    if (req.headers[header]) {
      console.warn(`Suspicious header detected: ${header} = ${req.headers[header]}`);
    }
  }

  // Validate User-Agent
  const userAgent = req.get('User-Agent');
  if (!userAgent || userAgent.length > 500) {
    return ResponseUtil.error(res, 'Invalid or missing User-Agent header.', 400);
  }

  return next();
};

/**
 * Enhanced helmet configuration
 */
export const enhancedHelmet = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some APIs
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
});

/**
 * File upload security
 */
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (req.files || req.file) {
    const files = Array.isArray(req.files) ? req.files : 
                  req.files ? Object.values(req.files).flat() : 
                  req.file ? [req.file] : [];

    for (const file of files) {
      // Check file type
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        return ResponseUtil.error(res, 'Invalid file type.', 400);
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        return ResponseUtil.error(res, 'File too large.', 400);
      }

      // Check filename for suspicious content
      if (/[<>:"/\\|?*]/.test(file.originalname)) {
        return ResponseUtil.error(res, 'Invalid filename.', 400);
      }
    }
  }

  return next();
};

/**
 * Combine all security middlewares
 */
export const securityMiddleware = [
  enhancedHelmet,
  validateHeaders,
  validateRequestSize(),
  sanitizeInput,
  sqlInjectionProtection,
  xssProtection,
  requestFrequencyCheck(),
  fileUploadSecurity
];