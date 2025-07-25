import { describe, beforeAll, afterAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { createConnection, Connection } from 'typeorm';
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// Global test database connection
let testConnection: Connection | null = null;
let testRedisClient: RedisClientType | null = null;

// Test database configuration
const TEST_DB_CONFIG = {
  type: 'sqlite' as const,
  database: ':memory:',
  synchronize: true,
  logging: false,
  entities: [],
};

// Mock Redis client
export const mockRedisClient = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  del: jest.fn().mockResolvedValue(1),
  exists: jest.fn().mockResolvedValue(0),
  expire: jest.fn().mockResolvedValue(1),
  ttl: jest.fn().mockResolvedValue(-1),
  keys: jest.fn().mockResolvedValue([]),
  flushall: jest.fn().mockResolvedValue('OK'),
  quit: jest.fn().mockResolvedValue('OK'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  isOpen: true,
  isReady: true,
};

// Test setup utilities
export const setupTestDatabase = async () => {
  if (!testConnection) {
    testConnection = await createConnection(TEST_DB_CONFIG);
  }
  return testConnection;
};

export const cleanupTestDatabase = async () => {
  if (testConnection && testConnection.isConnected) {
    await testConnection.close();
    testConnection = null;
  }
};

export const setupTestRedis = async () => {
  // Return mock Redis client for testing
  testRedisClient = mockRedisClient as any;
  return testRedisClient;
};

export const cleanupTestRedis = async () => {
  if (testRedisClient) {
    // Reset all mocks
    Object.values(mockRedisClient).forEach(mock => {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    });
    testRedisClient = null;
  }
};

// Socket.IO test utilities
export const createTestSocketClient = () => {
  // Mock socket client for testing
  return {
    id: 'test-socket-id',
    emit: jest.fn(),
    on: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
  };
};

export const cleanupTestSocket = (client: any) => {
  if (client && client.disconnect) {
    client.disconnect();
  }
};

// User authentication mock
export const mockAuthenticatedUser = {
  id: 1,
  email: 'test@example.com',
  userType: 'buyer' as const,
  name: 'Test User',
  isActive: true,
};

// Mock Express request and response
export const mockRequest = (overrides: any = {}) => ({
  user: mockAuthenticatedUser,
  body: {},
  params: {},
  query: {},
  headers: {},
  ...overrides,
});

export const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = () => jest.fn();

// Firebase Admin mock
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
  messaging: jest.fn().mockReturnValue({
    send: jest.fn().mockResolvedValue('message-id'),
    sendMulticast: jest.fn().mockResolvedValue({
      successCount: 1,
      failureCount: 0,
      responses: [{ success: true }],
    }),
    subscribeToTopic: jest.fn().mockResolvedValue(undefined),
    unsubscribeFromTopic: jest.fn().mockResolvedValue(undefined),
  }),
}));

// Nodemailer mock
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      accepted: ['test@example.com'],
      rejected: [],
    }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

// Global test setup
beforeAll(async () => {
  await setupTestDatabase();
  await setupTestRedis();
});

afterAll(async () => {
  await cleanupTestDatabase();
  await cleanupTestRedis();
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

export default {
  setupTestDatabase,
  cleanupTestDatabase,
  setupTestRedis,
  cleanupTestRedis,
  createTestSocketClient,
  cleanupTestSocket,
  mockAuthenticatedUser,
  mockRequest,
  mockResponse,
  mockNext,
  mockRedisClient,
};