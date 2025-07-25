import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { errorResponse } from '../utils/response.util';

/**
 * Rate limiting configurations for different endpoints
 */

// General API rate limit
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many requests from this IP, please try again later.',
      'RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Strict rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many authentication attempts, please try again later.',
      'AUTH_RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Payment rate limit
export const paymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment attempts per hour
  message: {
    success: false,
    message: 'Too many payment attempts, please try again later.',
    error: 'PAYMENT_RATE_LIMIT_EXCEEDED'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many payment attempts, please try again later.',
      'PAYMENT_RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Upload rate limit
export const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    message: 'Too many upload attempts, please try again later.',
    error: 'UPLOAD_RATE_LIMIT_EXCEEDED'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many upload attempts, please try again later.',
      'UPLOAD_RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Email rate limit
export const emailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails per hour (verification, password reset)
  message: {
    success: false,
    message: 'Too many email requests, please try again later.',
    error: 'EMAIL_RATE_LIMIT_EXCEEDED'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many email requests, please try again later.',
      'EMAIL_RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Listing creation rate limit
export const listingRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // 20 listings per day
  message: {
    success: false,
    message: 'Daily listing limit reached, please try again tomorrow.',
    error: 'LISTING_RATE_LIMIT_EXCEEDED'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Daily listing limit reached, please try again tomorrow.',
      'LISTING_RATE_LIMIT_EXCEEDED'
    ));
  }
});

// Order creation rate limit
export const orderRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour
  message: {
    success: false,
    message: 'Too many orders created, please try again later.',
    error: 'ORDER_RATE_LIMIT_EXCEEDED'
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json(errorResponse(
      'Too many orders created, please try again later.',
      'ORDER_RATE_LIMIT_EXCEEDED'
    ));
  }
});

/**
 * IP-based blocking for suspicious activity
 */
const suspiciousIPs = new Set<string>();
const ipAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const securityMiddleware = (req: Request, res: Response, next: any) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  
  // Check if IP is blocked
  if (suspiciousIPs.has(clientIP)) {
    return res.status(403).json(errorResponse(
      'Access denied due to suspicious activity.',
      'IP_BLOCKED'
    ));
  }
  
  // Track failed attempts
  if (req.path.includes('/auth/') && res.statusCode >= 400) {
    const attempts = ipAttempts.get(clientIP) || { count: 0, lastAttempt: new Date() };
    attempts.count++;
    attempts.lastAttempt = new Date();
    
    if (attempts.count >= 20) { // Block after 20 failed attempts
      suspiciousIPs.add(clientIP);
      console.log(`IP ${clientIP} blocked due to suspicious activity`);
    }
    
    ipAttempts.set(clientIP, attempts);
  }
  
  next();
};

/**
 * Clean up old IP tracking data
 */
setInterval(() => {
  const now = new Date();
  for (const [ip, data] of ipAttempts.entries()) {
    // Remove tracking data older than 24 hours
    if (now.getTime() - data.lastAttempt.getTime() > 24 * 60 * 60 * 1000) {
      ipAttempts.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour