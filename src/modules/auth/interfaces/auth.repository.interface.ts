/**
 * Auth Repository Interface
 *
 * Defines the contract for authentication-related database operations
 * Extends user repository with auth-specific functionality
 */

import {
  PasswordResetTokenData,
  LoginAttemptData,
  RefreshTokenData,
} from "./auth.service.interface.js";

/**
 * Account Security Data Interface
 */
export interface AccountSecurityData {
  userId: string;
  email: string;
  failedLoginAttempts: number;
  lastFailedAttempt?: Date;
  lockedUntil?: Date;
  passwordChangedAt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
}

/**
 * Email Verification Data Interface
 */
export interface EmailVerificationData {
  userId: string;
  email: string;
  token: string; // Hashed verification token
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

/**
 * Auth Repository Interface
 * Handles authentication-related database operations
 */
export interface IAuthRepository {
  // === User Authentication Methods ===

  /**
   * Find user by email with password for authentication
   * @param email - User email
   * @returns Promise<{id: string, email: string, password: string} | null>
   */
  findUserByEmailWithPassword(email: string): Promise<{
    id: string;
    email: string;
    password: string;
    role: string;
    isEmailVerified: boolean;
    isActive: boolean;
  } | null>;

  /**
   * Update user last login information
   * @param userId - User ID
   * @param loginInfo - Login information
   * @returns Promise<boolean> - Success status
   */
  updateLastLogin(
    userId: string,
    loginInfo: {
      loginAt: Date;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<boolean>;

  // === Password Reset Methods ===

  /**
   * Store password reset token
   * @param tokenData - Reset token data
   * @returns Promise<boolean> - Success status
   */
  storePasswordResetToken(tokenData: PasswordResetTokenData): Promise<boolean>;

  /**
   * Find password reset token
   * @param token - Reset token value
   * @returns Promise<PasswordResetTokenData | null> - Token data or null
   */
  findPasswordResetToken(token: string): Promise<PasswordResetTokenData | null>;

  /**
   * Mark password reset token as used
   * @param tokenId - Token ID
   * @returns Promise<boolean> - Success status
   */
  markResetTokenAsUsed(tokenId: string): Promise<boolean>;

  /**
   * Clean up expired password reset tokens
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupExpiredResetTokens(): Promise<number>;

  /**
   * Count recent password reset requests for email
   * @param email - User email
   * @param timeWindowMinutes - Time window in minutes
   * @returns Promise<number> - Number of recent requests
   */
  countRecentResetRequests(
    email: string,
    timeWindowMinutes: number
  ): Promise<number>;

  // === Account Security Methods ===

  /**
   * Get account security data
   * @param email - User email
   * @returns Promise<AccountSecurityData | null> - Security data or null
   */
  getAccountSecurity(email: string): Promise<AccountSecurityData | null>;

  /**
   * Record login attempt
   * @param attemptData - Login attempt data
   * @returns Promise<boolean> - Success status
   */
  recordLoginAttempt(attemptData: LoginAttemptData): Promise<boolean>;

  /**
   * Update failed login attempts count
   * @param email - User email
   * @param increment - Whether to increment (true) or reset (false)
   * @returns Promise<boolean> - Success status
   */
  updateFailedLoginAttempts(
    email: string,
    increment: boolean
  ): Promise<boolean>;

  /**
   * Lock user account
   * @param email - User email
   * @param lockDurationMinutes - Lock duration in minutes
   * @returns Promise<boolean> - Success status
   */
  lockAccount(email: string, lockDurationMinutes: number): Promise<boolean>;

  /**
   * Unlock user account
   * @param email - User email
   * @returns Promise<boolean> - Success status
   */
  unlockAccount(email: string): Promise<boolean>;

  /**
   * Check if account is locked
   * @param email - User email
   * @returns Promise<boolean> - Lock status
   */
  isAccountLocked(email: string): Promise<boolean>;

  // === Email Verification Methods ===

  /**
   * Store email verification token
   * @param tokenData - Verification token data
   * @returns Promise<boolean> - Success status
   */
  storeEmailVerificationToken(
    tokenData: EmailVerificationData
  ): Promise<boolean>;

  /**
   * Find email verification token
   * @param token - Verification token value
   * @returns Promise<EmailVerificationData | null> - Token data or null
   */
  findEmailVerificationToken(
    token: string
  ): Promise<EmailVerificationData | null>;

  /**
   * Mark email as verified
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  markEmailAsVerified(userId: string): Promise<boolean>;

  /**
   * Mark email verification token as used
   * @param tokenId - Token ID
   * @returns Promise<boolean> - Success status
   */
  markEmailVerificationTokenAsUsed(tokenId: string): Promise<boolean>;

  // === Audit Methods ===

  /**
   * Get login history for user
   * @param userId - User ID
   * @param limit - Number of records to return
   * @returns Promise<LoginAttemptData[]> - Login history
   */
  getLoginHistory(userId: string, limit?: number): Promise<LoginAttemptData[]>;

  /**
   * Clean up old login attempts
   * @param retentionDays - Number of days to retain
   * @returns Promise<number> - Number of cleaned records
   */
  cleanupOldLoginAttempts(retentionDays: number): Promise<number>;
}
