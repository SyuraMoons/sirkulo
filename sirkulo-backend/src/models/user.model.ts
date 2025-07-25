import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
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

  @Column({ type: 'text', nullable: true })
  firstName: string | null;

  @Column({ type: 'text', nullable: true })
  lastName: string | null;

  @Column({ type: 'text', nullable: true })
  phoneNumber: string | null;

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
  analyticsData: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  businessProfile: {
    companyName?: string;
    businessType?: string;
    registrationNumber?: string;
    address?: string;
    description?: string;
    website?: string;
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  recyclerProfile: {
    specialization?: string[];
    experience?: string;
    portfolio?: string[];
    certifications?: string[];
  } | null;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  } | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'text', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'text', nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  // Relationships
  @OneToMany('DeviceToken', 'user')
  deviceTokens: any[];

  @OneToMany('AIConversation', 'user')
  aiConversations: any[];

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