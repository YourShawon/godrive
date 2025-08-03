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

// ==================== NEW TYPES FOR AUTHSERVICE ====================

/**
 * Login Request Interface
 */
export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Login Response Interface
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user: Omit<any, "password">; // Will be properly typed later
  tokens: TokenPair;
}

/**
 * Register Request Interface
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Register Response Interface
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user: Omit<any, "password">; // Will be properly typed later
  tokens: TokenPair;
}

/**
 * Refresh Token Request Interface
 */
export interface RefreshTokenRequest {
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Refresh Token Response Interface
 */
export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  tokens: TokenPair;
}

/**
 * Logout Request Interface
 */
export interface LogoutRequest {
  userId: string;
  refreshToken?: string;
  accessToken?: string;
  logoutFromAllDevices?: boolean;
}

/**
 * Change Password Request Interface
 */
export interface ChangePasswordRequest {
  userId: string;
  currentPassword: string;
  newPassword: string;
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
   */
  register(registerData: RegisterRequest): Promise<RegisterResponse>;

  /**
   * Authenticate user with email/password
   */
  login(loginData: LoginRequest): Promise<LoginResponse>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshData: RefreshTokenRequest): Promise<RefreshTokenResponse>;

  /**
   * Logout user
   */
  logout(
    logoutData: LogoutRequest
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Change password for authenticated user
   */
  changePassword(
    changePasswordData: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }>;

  /**
   * Validate JWT token and return payload
   */
  validateToken(token: string): Promise<TokenPayload | null>;
}
