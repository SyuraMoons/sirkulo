import { AuthService } from '../services/auth.service';
import { PasswordUtil } from '../utils/password.util';
import { TokenUtil } from '../utils/token.util';
import { UserRole } from '../types';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('Password Utility', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await PasswordUtil.hashPassword(password);
      
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it('should validate password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await PasswordUtil.hashPassword(password);
      
      const isValid = await PasswordUtil.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await PasswordUtil.comparePassword('wrongpassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should validate password strength', () => {
      const weakPassword = '123';
      const strongPassword = 'TestPassword123!';
      
      const weakValidation = PasswordUtil.validatePassword(weakPassword);
      expect(weakValidation.isValid).toBe(false);
      expect(weakValidation.errors.length).toBeGreaterThan(0);
      
      const strongValidation = PasswordUtil.validatePassword(strongPassword);
      expect(strongValidation.isValid).toBe(true);
      expect(strongValidation.errors.length).toBe(0);
    });
  });

  describe('Token Utility', () => {
    const mockPayload = {
      userId: 1,
      email: 'test@example.com',
      roles: [UserRole.USER],
      activeMode: UserRole.USER,
    };

    it('should generate and verify access token', () => {
      const token = TokenUtil.generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = TokenUtil.verifyAccessToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should generate and verify refresh token', () => {
      const token = TokenUtil.generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = TokenUtil.verifyRefreshToken(token);
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });

    it('should generate token pair', () => {
      const tokens = TokenUtil.generateTokenPair(mockPayload);
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should extract token from header', () => {
      const token = 'sample-token';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = TokenUtil.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
      
      const invalidHeader = 'Invalid header';
      const nullToken = TokenUtil.extractTokenFromHeader(invalidHeader);
      expect(nullToken).toBeNull();
    });
  });
});

// Mock implementations for testing without actual database
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(() => ({
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    })),
  },
}));
