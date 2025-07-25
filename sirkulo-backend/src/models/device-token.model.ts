import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.model';

@Entity('device_tokens')
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  token: string;

  @Column({ type: 'enum', enum: ['android', 'ios', 'web'] })
  platform: 'android' | 'ios' | 'web';

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceInfo?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  appVersion?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastUsed?: Date;

  // Relationships
  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => User, user => user.deviceTokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Methods
  updateLastUsed(): void {
    this.lastUsed = new Date();
  }

  deactivate(): void {
    this.isActive = false;
  }

  activate(): void {
    this.isActive = true;
  }
}
