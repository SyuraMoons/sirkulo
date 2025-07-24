import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole, VerificationStatus } from '../types';

/**
 * User entity representing all users in the Sirkulo platform
 * Supports multiple roles: user, recycler, business, admin
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.USER],
  })
  roles: UserRole[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  activeMode: UserRole;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  verificationStatus: VerificationStatus;

  @Column({ type: 'text', array: true, default: [] })
  documents: string[];

  @Column({ type: 'jsonb', nullable: true })
  analyticsData: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  businessProfile: {
    companyName?: string;
    businessType?: string;
    registrationNumber?: string;
    address?: string;
    description?: string;
    website?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  recyclerProfile: {
    specialization?: string[];
    experience?: string;
    portfolio?: string[];
    certifications?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationToken: string;

  @Column({ nullable: true })
  passwordResetToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Get user's full name
   */
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.roles.includes(role);
  }

  /**
   * Check if user can switch to a specific mode
   */
  canSwitchToMode(mode: UserRole): boolean {
    return this.roles.includes(mode);
  }

  /**
   * Get sanitized user data (without sensitive fields)
   */
  toSafeObject(): Partial<User> {
    const { password, passwordResetToken, emailVerificationToken, ...safeUser } = this;
    return safeUser;
  }
}
