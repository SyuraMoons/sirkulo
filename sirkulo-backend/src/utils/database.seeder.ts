import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { Listing } from '../models/listing.model';
import { CartItem } from '../models/cart.model';
import { PasswordUtil } from './password.util';
import { UserRole, WasteType, ListingStatus } from '../types';

export class DatabaseSeeder {
  private static userRepository = AppDataSource.getRepository(User);
  private static listingRepository = AppDataSource.getRepository(Listing);
  private static cartRepository = AppDataSource.getRepository(CartItem);

  static async run(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');
      
      await this.createUsers();
      await this.createListings();
      await this.createCartItems();
      
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  private static async createUsers(): Promise<void> {
    const userCount = await this.userRepository.count();
    
    if (userCount > 0) {
      console.log('📝 Users already exist, skipping user creation');
      return;
    }

    const users = [
      {
        email: 'admin@sirkulo.com',
        password: await PasswordUtil.hashPassword('AdminPass123!'),
        firstName: 'System',
        lastName: 'Administrator',
        roles: [UserRole.ADMIN],
        activeMode: UserRole.ADMIN,
        isActive: true,
        emailVerified: true,
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        }
      },
      {
        email: 'fashion.biz@example.com',
        password: await PasswordUtil.hashPassword('SecurePass123!'),
        firstName: 'Fashion',
        lastName: 'Business',
        phoneNumber: '+62-812-3456-7890',
        roles: [UserRole.BUSINESS],
        activeMode: UserRole.BUSINESS,
        isActive: true,
        emailVerified: true,
        businessProfile: {
          companyName: 'Fashion Forward Ltd',
          businessType: 'MANUFACTURER',
          wasteGeneration: 'HIGH',
          description: 'Leading fashion manufacturer specializing in sustainable textile production'
        },
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        }
      },
      {
        email: 'eco.recycler@example.com',
        password: await PasswordUtil.hashPassword('EcoPass123!'),
        firstName: 'Eco',
        lastName: 'Recycler',
        phoneNumber: '+62-813-4567-8901',
        roles: [UserRole.RECYCLER],
        activeMode: UserRole.RECYCLER,
        isActive: true,
        emailVerified: true,
        recyclerProfile: {
          facilityType: 'PROCESSING_PLANT',
          capacity: 10000,
          certifications: ['ISO14001', 'GREENGUARD'],
          description: 'Advanced textile recycling facility with cutting-edge technology'
        },
        location: {
          latitude: -6.1944,
          longitude: 106.8229,
          address: 'Bandung, Indonesia'
        }
      },
      {
        email: 'green.transport@example.com',
        password: await PasswordUtil.hashPassword('TransportPass123!'),
        firstName: 'Green',
        lastName: 'Transport',
        phoneNumber: '+62-814-5678-9012',
        roles: [UserRole.USER],
        activeMode: UserRole.USER,
        isActive: true,
        emailVerified: true,
        location: {
          latitude: -7.2575,
          longitude: 112.7521,
          address: 'Surabaya, Indonesia'
        }
      },
      {
        email: 'textile.corp@example.com',
        password: await PasswordUtil.hashPassword('TextilePass123!'),
        firstName: 'Textile',
        lastName: 'Corporation',
        phoneNumber: '+62-815-6789-0123',
        roles: [UserRole.BUSINESS],
        activeMode: UserRole.BUSINESS,
        isActive: true,
        emailVerified: true,
        businessProfile: {
          companyName: 'Textile Corp Indonesia',
          businessType: 'MANUFACTURER',
          wasteGeneration: 'MEDIUM',
          description: 'Premium textile manufacturer with focus on circular economy'
        },
        location: {
          latitude: -6.9175,
          longitude: 107.6191,
          address: 'Bandung, Indonesia'
        }
      }
    ];

    for (const userData of users) {
      const user = this.userRepository.create(userData);
      await this.userRepository.save(user);
    }

    console.log(`✅ Created ${users.length} users`);
  }

  private static async createListings(): Promise<void> {
    const listingCount = await this.listingRepository.count();
    
    if (listingCount > 0) {
      console.log('📦 Listings already exist, skipping listing creation');
      return;
    }

    // Get business users by checking if roles array contains BUSINESS
    const businessUsers = await this.userRepository.createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: UserRole.BUSINESS })
      .getMany();

    if (businessUsers.length === 0) {
      console.log('⚠️  No business users found, skipping listing creation');
      return;
    }

    const listings = [
      {
        title: 'Cotton Fabric Scraps - Premium Quality',
        description: 'High-quality cotton fabric scraps from our premium textile production line. Perfect for upcycling and recycling projects.',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 500,
        unit: 'kg',
        pricePerUnit: 15000,
        status: ListingStatus.ACTIVE,
        business: businessUsers[0],
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        },
        availableFrom: new Date('2025-01-25'),
        availableUntil: new Date('2025-03-25'),
        images: ['cotton-scraps-1.jpg', 'cotton-scraps-2.jpg']
      },
      {
        title: 'Polyester Waste - Industrial Grade',
        description: 'Clean polyester waste from manufacturing process. Suitable for recycling into new polyester products.',
        wasteType: WasteType.TEXTILE_WASTE,
        quantity: 750,
        unit: 'kg',
        pricePerUnit: 12000,
        status: ListingStatus.ACTIVE,
        business: businessUsers[0],
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        },
        availableFrom: new Date('2025-01-26'),
        availableUntil: new Date('2025-04-26'),
        images: ['polyester-waste-1.jpg']
      },
      {
        title: 'Denim Cutting Waste',
        description: 'Denim fabric cuttings from jeans production. Various shades of blue denim available.',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 300,
        unit: 'kg',
        pricePerUnit: 18000,
        status: ListingStatus.ACTIVE,
        business: businessUsers.length > 1 ? businessUsers[1] : businessUsers[0],
        location: {
          latitude: -6.9175,
          longitude: 107.6191,
          address: 'Bandung, Indonesia'
        },
        availableFrom: new Date('2025-01-27'),
        availableUntil: new Date('2025-02-27'),
        images: ['denim-waste-1.jpg', 'denim-waste-2.jpg', 'denim-waste-3.jpg']
      },
      {
        title: 'Mixed Fabric Scraps - Assorted Colors',
        description: 'Assorted fabric scraps from various production runs. Great for craft projects and small-scale recycling.',
        wasteType: WasteType.FABRIC_SCRAPS,
        quantity: 200,
        unit: 'kg',
        pricePerUnit: 10000,
        status: ListingStatus.ACTIVE,
        business: businessUsers[0],
        location: {
          latitude: -6.2088,
          longitude: 106.8456,
          address: 'Jakarta, Indonesia'
        },
        availableFrom: new Date('2025-01-28'),
        availableUntil: new Date('2025-03-28'),
        images: ['mixed-scraps-1.jpg']
      },
      {
        title: 'Leather Offcuts - Genuine Leather',
        description: 'Premium leather offcuts from luxury goods production. Various sizes and colors available.',
        wasteType: WasteType.LEATHER_WASTE,
        quantity: 150,
        unit: 'kg',
        pricePerUnit: 35000,
        status: ListingStatus.ACTIVE,
        business: businessUsers.length > 1 ? businessUsers[1] : businessUsers[0],
        location: {
          latitude: -6.9175,
          longitude: 107.6191,
          address: 'Bandung, Indonesia'
        },
        availableFrom: new Date('2025-01-29'),
        availableUntil: new Date('2025-04-29'),
        images: ['leather-offcuts-1.jpg', 'leather-offcuts-2.jpg']
      }
    ];

    for (const listingData of listings) {
      const listing = this.listingRepository.create(listingData);
      await this.listingRepository.save(listing);
    }

    console.log(`✅ Created ${listings.length} listings`);
  }

  static async createCartItems(): Promise<void> {
    console.log('🛒 Creating cart items...');

    // Get some users and listings to create cart items
    const users = await this.userRepository.find({ take: 3 });
    const listings = await this.listingRepository.find({ take: 5 });

    if (users.length === 0 || listings.length === 0) {
      console.log('⚠️ No users or listings found, skipping cart items');
      return;
    }

    const cartItems = [
      {
        user: users[0],
        listing: listings[0],
        quantity: 5,
        pricePerUnit: listings[0].pricePerUnit || 0
      },
      {
        user: users[0],
        listing: listings[1],
        quantity: 2,
        pricePerUnit: listings[1].pricePerUnit || 0
      },
      {
        user: users[1],
        listing: listings[2],
        quantity: 10,
        pricePerUnit: listings[2].pricePerUnit || 0
      },
      {
        user: users[1],
        listing: listings[3],
        quantity: 3,
        pricePerUnit: listings[3].pricePerUnit || 0
      },
      {
        user: users[2],
        listing: listings[0],
        quantity: 1,
        pricePerUnit: listings[0].pricePerUnit || 0
      }
    ];

    for (const cartData of cartItems) {
      const cartItem = this.cartRepository.create(cartData);
      await this.cartRepository.save(cartItem);
    }

    console.log(`✅ Created ${cartItems.length} cart items`);
  }

  static async clear(): Promise<void> {
    try {
      console.log('🧹 Clearing database...');
      
      await this.cartRepository.delete({});
      await this.listingRepository.delete({});
      await this.userRepository.delete({});
      
      console.log('✅ Database cleared successfully!');
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