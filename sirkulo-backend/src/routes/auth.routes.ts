import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middlewares/validation.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';
import {
  SignUpDto,
  LoginDto,
  RefreshTokenDto,
  SwitchModeDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../types/auth.dto';

/**
 * Authentication routes
 * Handles all authentication-related endpoints
 */
const router = Router();
const authController = new AuthController();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/signup',
  validateDto(SignUpDto),
  authController.signup
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post(
  '/login',
  validateDto(LoginDto),
  authController.login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post(
  '/refresh',
  validateDto(RefreshTokenDto),
  authController.refreshToken
);

/**
 * @route   POST /api/auth/switch-mode
 * @desc    Switch user active mode (user/recycler/business)
 * @access  Private
 */
router.post(
  '/switch-mode',
  authenticateToken,
  validateDto(SwitchModeDto),
  authController.switchMode
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post(
  '/forgot-password',
  validateDto(ForgotPasswordDto),
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using token
 * @access  Public
 */
router.post(
  '/reset-password',
  validateDto(ResetPasswordDto),
  authController.resetPassword
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email
 * @access  Public
 */
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticateToken,
  authController.getProfile
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token removal)
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

export default router;
