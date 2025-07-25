import { AppDataSource } from '../config/database';
import { initializeRedis } from '../config/redis';
import { Redis } from 'redis';

// Global test setup
beforeAll(async () => {
  // Initialize test database
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  
  // Initialize Redis for testing
  await initializeRedis();
  
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
});

// Clean up after each test
afterEach(async () => {
  // Clear all test data but keep schema
  const entities = AppDataSource.entityMetadatas;
  
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }
  
  // Clear Redis test data
  const redis = AppDataSource.manager.connection.queryRunner?.data?.redis as Redis;
  if (redis) {
    await redis.flushdb();
  }
});

// Global test teardown
afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
});

// Mock external services for testing
jest.mock('../services/email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendVerificationEmail: jest.fn().mockResolvedValue(true),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
    sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true),
    sendPaymentConfirmationEmail: jest.fn().mockResolvedValue(true)
  }))
}));

// Mock Xendit for testing
jest.mock('xendit-node', () => ({
  Xendit: jest.fn().mockImplementation(() => ({
    Invoice: {
      createInvoice: jest.fn().mockResolvedValue({
        id: 'test-invoice-id',
        invoice_url: 'https://test-payment-url.com',
        external_id: 'test-external-id',
        status: 'PENDING'
      })
    },
    VirtualAccount: {
      createVirtualAccount: jest.fn().mockResolvedValue({
        id: 'test-va-id',
        external_id: 'test-external-id',
        bank_code: 'BCA',
        account_number: '8808123456789',
        status: 'PENDING'
      })
    },
    EWallet: {
      createEWalletCharge: jest.fn().mockResolvedValue({
        id: 'test-ewallet-id',
        reference_id: 'test-reference-id',
        status: 'PENDING',
        actions: {
          mobile_web_checkout_url: 'https://test-ewallet-url.com'
        }
      })
    },
    RetailOutlet: {
      createFixedPaymentCode: jest.fn().mockResolvedValue({
        id: 'test-retail-id',
        external_id: 'test-external-id',
        retail_outlet_name: 'ALFAMART',
        payment_code: 'TEST123456',
        status: 'ACTIVE'
      })
    },
    Payment: {
      createRefund: jest.fn().mockResolvedValue({
        id: 'test-refund-id',
        payment_request_id: 'test-payment-id',
        amount: 100000,
        status: 'PENDING'
      })
    }
  }))
}));

// Mock Firebase Admin for testing
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  messaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue('test-message-id'),
    sendMulticast: jest.fn().mockResolvedValue({
      successCount: 1,
      failureCount: 0,
      responses: [{ success: true, messageId: 'test-message-id' }]
    })
  }))
}));

// Test utilities
export const createTestUser = async (overrides: any = {}) => {
  const { User } = await import('../models/user.model');
  const { UserRole } = await import('../types/enums');
  
  return AppDataSource.getRepository(User).save({
    email: 'test@example.com',
    password: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'User',
    roles: [UserRole.USER],
    activeMode: UserRole.USER,
    isActive: true,
    emailVerified: true,
    ...overrides
  });
};

export const createTestBusiness = async (overrides: any = {}) => {
  const { User } = await import('../models/user.model');
  const { UserRole } = await import('../types/enums');
  
  return AppDataSource.getRepository(User).save({
    email: 'business@example.com',
    password: 'hashedpassword123',
    firstName: 'Test',
    lastName: 'Business',
    roles: [UserRole.BUSINESS],
    activeMode: UserRole.BUSINESS,
    isActive: true,
    emailVerified: true,
    businessProfile: {
      companyName: 'Test Business',
      businessType: 'Fashion Manufacturer',
      registrationNumber: 'TEST123456'
    },
    ...overrides
  });
};

export const createTestListing = async (businessId: number, overrides: any = {}) => {
  const { Listing } = await import('../models/listing.model');
  const { WasteType, ListingStatus } = await import('../types/enums');
  
  return AppDataSource.getRepository(Listing).save({
    title: 'Test Fabric Waste',
    description: 'High quality cotton fabric scraps',
    wasteType: WasteType.FABRIC_SCRAPS,
    quantity: 100,
    unit: 'kg',
    pricePerUnit: 15000,
    totalPrice: 1500000,
    isNegotiable: false,
    status: ListingStatus.ACTIVE,
    location: {
      latitude: -6.2088,
      longitude: 106.8456,
      address: 'Jakarta',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      postalCode: '12345'
    },
    businessId,
    isActive: true,
    ...overrides
  });
};

export const generateTestJWT = async (userId: number, roles: string[], activeMode: string) => {
  const { TokenUtil } = await import('../utils/token.util');
  
  return TokenUtil.generateTokenPair({
    userId,
    email: 'test@example.com',
    roles: roles as any,
    activeMode: activeMode as any
  });
};