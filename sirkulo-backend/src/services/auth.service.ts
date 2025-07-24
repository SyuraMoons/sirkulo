import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/user.model';
import { SignUpDto, LoginDto, SwitchModeDto, ForgotPasswordDto, ResetPasswordDto } from '../types/auth.dto';
import { UserRole, VerificationStatus, JwtPayload } from '../types';
import { PasswordUtil } from '../utils/password.util';
import { TokenUtil } from '../utils/token.util';
import crypto from 'crypto';

/**
 * Authentication Service
 * Handles user authentication, registration, and token management
 */
export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Register a new user
   */
  async signUp(signUpDto: SignUpDto): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password, firstName, lastName, phoneNumber, roles, activeMode } = signUpDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = PasswordUtil.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password
    const hashedPassword = await PasswordUtil.hashPassword(password);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Set default roles and active mode
    const userRoles = roles && roles.length > 0 ? roles : [UserRole.USER];
    const userActiveMode = activeMode || UserRole.USER;

    // Validate that activeMode is in roles
    if (!userRoles.includes(userActiveMode)) {
      throw new Error('Active mode must be one of the assigned roles');
    }

    // Create new user
    const newUser = this.userRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phoneNumber,
      roles: userRoles,
      activeMode: userActiveMode,
      emailVerificationToken,
      verificationStatus: VerificationStatus.PENDING,
    });

    // Save user to database
    const savedUser = await this.userRepository.save(newUser);

    // Generate tokens
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: savedUser.id,
      email: savedUser.email,
      roles: savedUser.roles,
      activeMode: savedUser.activeMode,
    };

    const tokens = TokenUtil.generateTokenPair(tokenPayload);

    // Update last login
    savedUser.lastLoginAt = new Date();
    await this.userRepository.save(savedUser);

    return {
      user: savedUser.toSafeObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Authenticate user login
   */
  async login(loginDto: LoginDto): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await PasswordUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      roles: user.roles,
      activeMode: user.activeMode,
    };

    const tokens = TokenUtil.generateTokenPair(tokenPayload);

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    return {
      user: user.toSafeObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const payload = TokenUtil.verifyRefreshToken(refreshToken);

      // Find user to ensure they still exist and are active
      const user = await this.userRepository.findOne({ where: { id: payload.userId } });
      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        roles: user.roles,
        activeMode: user.activeMode,
      };

      return TokenUtil.generateTokenPair(tokenPayload);
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Switch user mode
   */
  async switchMode(userId: number, switchModeDto: SwitchModeDto): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const { mode } = switchModeDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user can switch to this mode
    if (!user.canSwitchToMode(mode)) {
      throw new Error(`You don't have permission to switch to ${mode} mode`);
    }

    // Update active mode
    user.activeMode = mode;
    const updatedUser = await this.userRepository.save(user);

    // Generate new tokens with updated mode
    const tokenPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: updatedUser.id,
      email: updatedUser.email,
      roles: updatedUser.roles,
      activeMode: updatedUser.activeMode,
    };

    const tokens = TokenUtil.generateTokenPair(tokenPayload);

    return {
      user: updatedUser.toSafeObject(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists for security
      return;
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  /**
   * Reset password using token
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    // Find user with valid reset token
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    const passwordValidation = PasswordUtil.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedPassword = await PasswordUtil.hashPassword(newPassword);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  /**
   * Verify email using token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new Error('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;
    await this.userRepository.save(user);
  }
}
