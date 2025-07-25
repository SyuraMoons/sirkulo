import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';

/**
 * Audit log entity for tracking user actions
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn
} from 'typeorm';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
@Index(['ipAddress'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  userId?: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ type: 'varchar', length: 100 })
  action!: string;

  @Column({ type: 'varchar', length: 100 })
  resource!: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues?: Record<string, any>;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @Column({ type: 'varchar', length: 10 })
  method!: string;

  @Column({ type: 'text' })
  endpoint!: string;

  @Column({ type: 'integer', nullable: true })
  statusCode?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  createdAt!: Date;
}

/**
 * Audit service for logging user actions and system events
 */
export class AuditService {
  private auditLogRepository: Repository<AuditLog>;

  constructor() {
    this.auditLogRepository = AppDataSource.getRepository(AuditLog);
  }

  /**
   * Log user action
   */
  async logAction(
    action: string,
    resource: string,
    userId?: number,
    resourceId?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId,
        action,
        resource,
        resourceId,
        oldValues,
        newValues,
        metadata,
        method: 'SYSTEM',
        endpoint: 'internal'
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  }

  /**
   * Log HTTP request
   */
  async logRequest(
    method: string,
    endpoint: string,
    statusCode: number,
    userId?: number,
    ipAddress?: string,
    userAgent?: string,
    errorMessage?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId,
        action: 'HTTP_REQUEST',
        resource: 'API',
        method,
        endpoint,
        statusCode,
        ipAddress,
        userAgent,
        errorMessage,
        metadata
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      console.error('Failed to log HTTP request:', error);
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_RESET' | 'EMAIL_VERIFICATION',
    userId?: number,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      action,
      'AUTH',
      userId,
      undefined,
      undefined,
      undefined,
      {
        ipAddress,
        userAgent,
        ...metadata
      }
    );
  }

  /**
   * Log payment events
   */
  async logPayment(
    action: 'PAYMENT_CREATED' | 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'REFUND_CREATED',
    paymentId: string,
    userId: number,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      action,
      'PAYMENT',
      userId,
      paymentId,
      undefined,
      { amount },
      metadata
    );
  }

  /**
   * Log order events
   */
  async logOrder(
    action: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_CANCELLED' | 'ORDER_COMPLETED',
    orderId: string,
    userId: number,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      action,
      'ORDER',
      userId,
      orderId,
      oldValues,
      newValues,
      metadata
    );
  }

  /**
   * Log listing events
   */
  async logListing(
    action: 'LISTING_CREATED' | 'LISTING_UPDATED' | 'LISTING_DELETED' | 'LISTING_VIEWED',
    listingId: string,
    userId?: number,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      action,
      'LISTING',
      userId,
      listingId,
      oldValues,
      newValues,
      metadata
    );
  }

  /**
   * Log security events
   */
  async logSecurity(
    action: 'SUSPICIOUS_ACTIVITY' | 'IP_BLOCKED' | 'RATE_LIMIT_EXCEEDED' | 'UNAUTHORIZED_ACCESS',
    ipAddress?: string,
    userId?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.logAction(
      action,
      'SECURITY',
      userId,
      undefined,
      undefined,
      undefined,
      {
        ipAddress,
        ...metadata
      }
    );
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(filters: {
    userId?: number;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 50 } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.user', 'user');

    if (filters.userId) {
      queryBuilder.andWhere('log.userId = :userId', { userId: filters.userId });
    }

    if (filters.action) {
      queryBuilder.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.resource) {
      queryBuilder.andWhere('log.resource = :resource', { resource: filters.resource });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('log.createdAt', 'DESC');

    const total = await queryBuilder.getCount();
    const logs = await queryBuilder.skip(skip).take(limit).getMany();

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get security summary
   */
  async getSecuritySummary(days: number = 7): Promise<{
    totalEvents: number;
    suspiciousActivities: number;
    blockedIPs: number;
    rateLimitExceeded: number;
    unauthorizedAccess: number;
    topFailedEndpoints: Array<{ endpoint: string; count: number }>;
    topSuspiciousIPs: Array<{ ip: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const securityLogs = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.resource = :resource', { resource: 'SECURITY' })
      .andWhere('log.createdAt >= :startDate', { startDate })
      .getMany();

    const failedRequests = await this.auditLogRepository
      .createQueryBuilder('log')
      .where('log.statusCode >= :code', { code: 400 })
      .andWhere('log.createdAt >= :startDate', { startDate })
      .getMany();

    // Aggregate data
    const suspiciousActivities = securityLogs.filter(log => 
      log.action === 'SUSPICIOUS_ACTIVITY'
    ).length;

    const blockedIPs = securityLogs.filter(log => 
      log.action === 'IP_BLOCKED'
    ).length;

    const rateLimitExceeded = securityLogs.filter(log => 
      log.action === 'RATE_LIMIT_EXCEEDED'
    ).length;

    const unauthorizedAccess = securityLogs.filter(log => 
      log.action === 'UNAUTHORIZED_ACCESS'
    ).length;

    // Top failed endpoints
    const endpointCounts = new Map<string, number>();
    failedRequests.forEach(log => {
      const count = endpointCounts.get(log.endpoint) || 0;
      endpointCounts.set(log.endpoint, count + 1);
    });

    const topFailedEndpoints = Array.from(endpointCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top suspicious IPs
    const ipCounts = new Map<string, number>();
    securityLogs.forEach(log => {
      if (log.ipAddress) {
        const count = ipCounts.get(log.ipAddress) || 0;
        ipCounts.set(log.ipAddress, count + 1);
      }
    });

    const topSuspiciousIPs = Array.from(ipCounts.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalEvents: securityLogs.length,
      suspiciousActivities,
      blockedIPs,
      rateLimitExceeded,
      unauthorizedAccess,
      topFailedEndpoints,
      topSuspiciousIPs
    };
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}