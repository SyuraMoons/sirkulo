import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response.util';
import { 
  SignUpDto, 
  LoginDto, 
  RefreshTokenDto, 
  SwitchModeDto, 
  ForgotPasswordDto, 
  ResetPasswordDto,
  AuthenticatedRequest
} from '../types/auth.dto';

/**
 * Authentication Controller
 * Handles HTTP requests for authentication-related operations
 */
export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * User registration endpoint
   * POST /api/auth/signup
   */
  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const signUpDto: SignUpDto = req.body;
      const result = await this.authService.signUp(signUpDto);
      
      ResponseUtil.success(
        res,
        {
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
        'User registered successfully',
        201
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      ResponseUtil.error(res, message, 400);
    }
  };

  /**
   * User login endpoint
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);
      
      ResponseUtil.success(
        res,
        {
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
        'Login successful'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      ResponseUtil.error(res, message, 401);
    }
  };

  /**
   * Refresh token endpoint
   * POST /api/auth/refresh
   */
  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenDto = req.body;
      const result = await this.authService.refreshToken(refreshToken);
      
      ResponseUtil.success(
        res,
        {
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
        'Token refreshed successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      ResponseUtil.error(res, message, 401);
    }
  };

  /**
   * Switch user mode endpoint
   * POST /api/auth/switch-mode
   */
  switchMode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const switchModeDto: SwitchModeDto = req.body;
      const result = await this.authService.switchMode(req.user.userId, switchModeDto);
      
      ResponseUtil.success(
        res,
        {
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
        `Mode switched to ${switchModeDto.mode} successfully`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mode switch failed';
      ResponseUtil.error(res, message, 400);
    }
  };

  /**
   * Forgot password endpoint
   * POST /api/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const forgotPasswordDto: ForgotPasswordDto = req.body;
      await this.authService.forgotPassword(forgotPasswordDto);
      
      ResponseUtil.success(
        res,
        null,
        'If an account with that email exists, a password reset link has been sent'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset request failed';
      ResponseUtil.error(res, message, 400);
    }
  };

  /**
   * Reset password endpoint
   * POST /api/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetPasswordDto: ResetPasswordDto = req.body;
      await this.authService.resetPassword(resetPasswordDto);
      
      ResponseUtil.success(
        res,
        null,
        'Password reset successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      ResponseUtil.error(res, message, 400);
    }
  };

  /**
   * Verify email endpoint
   * GET /api/auth/verify-email/:token
   */
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      await this.authService.verifyEmail(token);
      
      ResponseUtil.success(
        res,
        null,
        'Email verified successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Email verification failed';
      ResponseUtil.error(res, message, 400);
    }
  };

  /**
   * Get current user profile endpoint
   * GET /api/auth/me
   */
  getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        ResponseUtil.unauthorized(res);
        return;
      }

      const user = await this.authService.getUserById(req.user.userId);
      if (!user) {
        ResponseUtil.notFound(res, 'User not found');
        return;
      }
      
      ResponseUtil.success(
        res,
        { user: user.toSafeObject() },
        'Profile retrieved successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve profile';
      ResponseUtil.error(res, message, 500);
    }
  };

  /**
   * Logout endpoint (client-side token removal, optional server-side blacklisting)
   * POST /api/auth/logout
   */
  logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // In a more advanced implementation, you might want to blacklist the token
      // For now, we just return success and let the client handle token removal
      
      ResponseUtil.success(
        res,
        null,
        'Logged out successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      ResponseUtil.error(res, message, 500);
    }
  };
}
