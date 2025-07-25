import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

/**
 * Audit middleware for logging HTTP requests and user actions
 */
export class AuditMiddleware {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Log all HTTP requests
   */
  logRequest = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Capture original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    let responseBody: any;

    // Override response methods to capture response
    res.send = function(body: any) {
      responseBody = body;
      return originalSend.call(this, body);
    };

    res.json = function(body: any) {
      responseBody = body;
      return originalJson.call(this, body);
    };

    // Log after response is sent
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const userId = req.user?.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');
      
      // Don't log health checks and static files
      if (req.path === '/health' || req.path.startsWith('/static')) {
        return;
      }

      let errorMessage: string | undefined;
      if (res.statusCode >= 400) {
        errorMessage = typeof responseBody === 'object' 
          ? responseBody.message || responseBody.error 
          : responseBody;
      }

      await this.auditService.logRequest(
        req.method,
        req.path,
        res.statusCode,
        userId,
        ipAddress,
        userAgent,
        errorMessage,
        {
          duration,
          queryParams: req.query,
          bodySize: req.get('Content-Length'),
          responseSize: res.get('Content-Length')
        }
      );
    });

    next();
  };

  /**
   * Log authentication events
   */
  logAuthEvent = (action: string) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.user?.userId;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      await this.auditService.logAuth(
        action as any,
        userId,
        ipAddress,
        userAgent,
        {
          email: req.body?.email,
          endpoint: req.path
        }
      );

      next();
    };
  };

  /**
   * Log data modification events
   */
  logDataChange = (resource: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;
      const originalJson = res.json;

      let responseData: any;

      res.send = function(body: any) {
        responseData = body;
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        responseData = body;
        return originalJson.call(this, body);
      };

      res.on('finish', async () => {
        // Only log successful operations
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const userId = req.user?.userId;
          const resourceId = req.params?.id || responseData?.data?.id;
          
          const oldValues = req.body?._oldValues;
          const newValues = req.body;

          await this.auditService.logAction(
            action,
            resource,
            userId,
            resourceId,
            oldValues,
            newValues,
            {
              endpoint: req.path,
              method: req.method
            }
          );
        }
      });

      next();
    };
  };

  /**
   * Log security events
   */
  logSecurityEvent = (action: string, metadata?: Record<string, any>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userId = req.user?.userId;

      await this.auditService.logSecurity(
        action as any,
        ipAddress,
        userId,
        {
          endpoint: req.path,
          method: req.method,
          userAgent: req.get('User-Agent'),
          ...metadata
        }
      );

      next();
    };
  };
}

// Create singleton instance
export const auditMiddleware = new AuditMiddleware();