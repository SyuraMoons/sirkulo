import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { UserRole, VerificationStatus } from '../types';
import { PasswordUtil } from '../utils/password.util';

/**
 * Database seeder for development and testing
 */
export class DatabaseSeeder {
  /**
   * Seed initial data
   */
  static async run(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      await this.createUsers();

      console.log('✅ Database seeding completed successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Create sample users
   */
  private static async createUsers(): Promise<void> {
    const userRepository = AppDataSource.getRepository(User);

    // Check if users already exist
    const existingUsers = await userRepository.count();
    if (existingUsers > 0) {
      console.log('📝 Users already exist, skipping user creation');
      return;
    }

    const users = [
      {
        email: 'admin@sirkulo.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        roles: [UserRole.ADMIN, UserRole.USER],
        activeMode: UserRole.ADMIN,
        verificationStatus: VerificationStatus.VERIFIED,
        emailVerified: true,
      },
      {
        email: 'business@sirkulo.com',
        password: 'Business123!',
        firstName: 'Business',
        lastName: 'Owner',
        roles: [UserRole.BUSINESS, UserRole.USER],
        activeMode: UserRole.BUSINESS,
        verificationStatus: VerificationStatus.VERIFIED,
        emailVerified: true,
        businessProfile: {
          companyName: 'Fashion Waste Co.',
          businessType: 'Manufacturing',
          registrationNumber: 'REG123456',
          address: '123 Business St, Jakarta',
          description: 'Leading fashion manufacturer focused on sustainability',
        },
      },
      {
        email: 'recycler@sirkulo.com',
        password: 'Recycler123!',
        firstName: 'Eco',
        lastName: 'Recycler',
        roles: [UserRole.RECYCLER, UserRole.USER],
        activeMode: UserRole.RECYCLER,
        verificationStatus: VerificationStatus.VERIFIED,
        emailVerified: true,
        recyclerProfile: {
          specialization: ['fabric_upcycling', 'textile_processing'],
          experience: '5 years',
          certifications: ['ISO 14001', 'GRS Certification'],
        },
      },
      {
        email: 'user@sirkulo.com',
        password: 'User123!',
        firstName: 'Regular',
        lastName: 'User',
        roles: [UserRole.USER],
        activeMode: UserRole.USER,
        verificationStatus: VerificationStatus.VERIFIED,
        emailVerified: true,
      },
    ];

    for (const userData of users) {
      const hashedPassword = await PasswordUtil.hashPassword(userData.password);
      
      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await userRepository.save(user);
      console.log(`👤 Created user: ${userData.email}`);
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  static async clear(): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.clear();
      console.log('🗑️ Database cleared successfully');
    } catch (error) {
      console.error('❌ Database clearing failed:', error);
      throw error;
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      await DatabaseSeeder.run();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database connection failed:', error);
      process.exit(1);
    });
}
