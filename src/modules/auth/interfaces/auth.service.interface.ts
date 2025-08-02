/**
 * Authentication Service Interface
 *
 * Defines the contract for authentication-related operations
 * Follows the same pattern as IUserService for consistency
 */

import { SafeUser } from "../../user/interfaces/user.repository.interface.js";
import {
  RegisterInput,
  LoginInput,
  RefreshTokenInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "../schemas/auth.schemas.js";

/**
 * JWT Token Pair Interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // Access token expiration in seconds
}

/**
 * Authentication Response Interface
 */
export interface AuthResponse {
  user: SafeUser;
  tokens: TokenPair;
}

/**
 * Token Payload Interface (what's stored in JWT)
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expires at
}

/**
 * Refresh Token Data Interface (stored in database/cache)
 */
export interface RefreshTokenData {
  tokenId: string;
  userId: string;
  token: string; // Hashed refresh token
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
  deviceInfo?: {
    userAgent?: string;
    ipAddress?: string;
  };
}

/**
 * Password Reset Token Data Interface
 */
export interface PasswordResetTokenData {
  tokenId: string;
  userId: string;
  token: string; // Hashed reset token
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
  email: string;
}

/**
 * Login Attempt Data Interface (for rate limiting)
 */
export interface LoginAttemptData {
  email: string;
  ipAddress: string;
  timestamp: Date;
  success: boolean;
  userAgent?: string;
}

/**
 * Authentication Service Interface
 * Main contract for all authentication operations
 */
export interface IAuthService {
  /**
   * Register a new user
   * @param userData - User registration data
   * @returns Promise<AuthResponse> - User and tokens
   * @throws InvalidUserDataError, UserAlreadyExistsError, UserOperationFailedError
   */
  register(userData: RegisterInput): Promise<AuthResponse>;

  /**
   * Authenticate user with email/password
   * @param credentials - Email and password
   * @param deviceInfo - Optional device information for tracking
   * @returns Promise<AuthResponse> - User and tokens
   * @throws InvalidCredentialsError, AccountLockedError, AccountDisabledError
   */
  login(
    credentials: LoginInput,
    deviceInfo?: { userAgent?: string; ipAddress?: string }
  ): Promise<AuthResponse>;

  /**
   * Refresh access token using refresh token
   * @param refreshData - Refresh token data
   * @returns Promise<TokenPair> - New token pair
   * @throws InvalidTokenError, TokenExpiredError, RefreshTokenNotFoundError
   */
  refreshToken(refreshData: RefreshTokenInput): Promise<TokenPair>;

  /**
   * Logout user (invalidate refresh token)
   * @param refreshToken - Refresh token to invalidate
   * @returns Promise<boolean> - Success status
   * @throws InvalidTokenError
   */
  logout(refreshToken: string): Promise<boolean>;

  /**
   * Logout from all devices (invalidate all refresh tokens for user)
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  logoutAllDevices(userId: string): Promise<boolean>;

  /**
   * Request password reset (send email)
   * @param resetData - Email for password reset
   * @returns Promise<boolean> - Success status
   * @throws AccountNotFoundError, TooManyResetRequestsError
   */
  forgotPassword(resetData: ForgotPasswordInput): Promise<boolean>;

  /**
   * Reset password using reset token
   * @param resetData - Reset token and new password
   * @returns Promise<boolean> - Success status
   * @throws InvalidResetTokenError, ResetTokenExpiredError, ResetTokenUsedError
   */
  resetPassword(resetData: ResetPasswordInput): Promise<boolean>;

  /**
   * Change password for authenticated user
   * @param userId - User ID
   * @param passwordData - Current and new password
   * @returns Promise<boolean> - Success status
   * @throws InvalidCredentialsError, UserNotFoundError
   */
  changePassword(
    userId: string,
    passwordData: ChangePasswordInput
  ): Promise<boolean>;

  /**
   * Verify JWT token and return user data
   * @param token - JWT access token
   * @returns Promise<SafeUser> - User data
   * @throws InvalidTokenError, TokenExpiredError, UserNotFoundError
   */
  verifyToken(token: string): Promise<SafeUser>;

  /**
   * Check if user account is locked
   * @param email - User email
   * @returns Promise<boolean> - Lock status
   */
  isAccountLocked(email: string): Promise<boolean>;
}
