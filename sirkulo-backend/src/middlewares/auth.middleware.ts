import { Request, Response, NextFunction } from 'express';
import { TokenUtil } from '../utils/token.util';
import { ResponseUtil } from '../utils/response.util';
import { JwtPayload, UserRole } from '../types';

/**
 * Extended Request interface to include user data
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      ResponseUtil.unauthorized(res, 'Access token is required');
      return;
    }

    // Verify the token
    const payload = TokenUtil.verifyAccessToken(token);
    req.user = payload;
    
    next();
  } catch (error) {
    ResponseUtil.unauthorized(res, 'Invalid or expired access token');
    return;
  }
};

/**
 * Role-based authorization middleware
 * @param allowedRoles - Array of roles that can access the route
 * @param requireActiveMode - If true, checks activeMode instead of roles array
 */
export const requireRole = (
  allowedRoles: UserRole[],
  requireActiveMode: boolean = false
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const userRolesToCheck = requireActiveMode 
      ? [req.user.activeMode] 
      : req.user.roles;

    const hasPermission = allowedRoles.some(role => 
      userRolesToCheck.includes(role)
    );

    if (!hasPermission) {
      const modeText = requireActiveMode ? 'active mode' : 'roles';
      ResponseUtil.forbidden(
        res, 
        `Access denied. Required ${modeText}: ${allowedRoles.join(', ')}`
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to require specific active mode
 * @param requiredMode - The required active mode
 */
export const requireActiveMode = (requiredMode: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    if (req.user.activeMode !== requiredMode) {
      ResponseUtil.forbidden(
        res, 
        `Access denied. Switch to ${requiredMode} mode to access this resource.`
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has any of the specified roles
 * @param roles - Array of roles to check
 */
export const hasAnyRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ResponseUtil.unauthorized(res, 'Authentication required');
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    
    if (!hasRole) {
      ResponseUtil.forbidden(
        res, 
        `Access denied. Required roles: ${roles.join(', ')}`
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const requireAdmin = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  if (!req.user) {
    ResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  if (!req.user.roles.includes(UserRole.ADMIN)) {
    ResponseUtil.forbidden(res, 'Admin access required');
    return;
  }

  next();
};

/**
 * Optional authentication middleware
 * Sets user data if token is valid, but doesn't reject if no token
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenUtil.extractTokenFromHeader(authHeader);

    if (token) {
      const payload = TokenUtil.verifyAccessToken(token);
      req.user = payload;
    }
  } catch (error) {
    // Silently ignore token errors for optional auth
  }
  
  next();
};
