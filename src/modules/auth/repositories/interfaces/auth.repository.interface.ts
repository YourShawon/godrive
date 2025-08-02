/**
 * Auth Repository Interface
 *
 * Defines data access patterns for authentication operations
 * Handles user authentication, session management, and security operations
 */

import { User } from "@prisma/client";

/**
 * Login Credentials Interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * User Registration Data Interface
 */
export interface UserRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

/**
 * Password Reset Data Interface
 */
export interface PasswordResetData {
  userId: string;
  resetToken: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

/**
 * User Session Data Interface
 */
export interface UserSessionData {
  sessionId: string;
  userId: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  expiresAt: Date;
  lastAccessedAt: Date;
  createdAt: Date;
}

/**
 * Account Verification Data Interface
 */
export interface AccountVerificationData {
  userId: string;
  verificationToken: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
}

/**
 * Login Attempt Data Interface
 */
export interface LoginAttemptData {
  email: string;
  ipAddress: string;
  userAgent?: string;
  isSuccessful: boolean;
  failureReason?: string;
  attemptedAt: Date;
}

/**
 * Account Lock Data Interface
 */
export interface AccountLockData {
  userId: string;
  lockReason: string;
  lockedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

/**
 * Auth Repository Interface
 * Handles all authentication-related database operations
 */
export interface IAuthRepository {
  // ==================== USER AUTHENTICATION ====================

  /**
   * Find user by email for authentication
   * @param email - User email
   * @returns Promise<User | null> - User with hashed password or null
   */
  findUserByEmail(email: string): Promise<User | null>;

  /**
   * Find user by ID for token operations
   * @param userId - User ID
   * @returns Promise<User | null> - User data or null
   */
  findUserById(userId: string): Promise<User | null>;

  /**
   * Create new user account
   * @param userData - User registration data
   * @returns Promise<User> - Created user
   */
  createUser(userData: UserRegistrationData): Promise<User>;

  /**
   * Update user password
   * @param userId - User ID
   * @param hashedPassword - New hashed password
   * @returns Promise<boolean> - Success status
   */
  updateUserPassword(userId: string, hashedPassword: string): Promise<boolean>;

  /**
   * Update user's last login timestamp
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  updateLastLogin(userId: string): Promise<boolean>;

  // ==================== ACCOUNT VERIFICATION ====================

  /**
   * Create account verification token
   * @param verificationData - Verification token data
   * @returns Promise<boolean> - Success status
   */
  createVerificationToken(
    verificationData: AccountVerificationData
  ): Promise<boolean>;

  /**
   * Find verification token
   * @param token - Verification token
   * @returns Promise<AccountVerificationData | null> - Token data or null
   */
  findVerificationToken(token: string): Promise<AccountVerificationData | null>;

  /**
   * Mark verification token as used
   * @param token - Verification token
   * @returns Promise<boolean> - Success status
   */
  markVerificationTokenUsed(token: string): Promise<boolean>;

  /**
   * Verify user account
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  verifyUserAccount(userId: string): Promise<boolean>;

  // ==================== PASSWORD RESET ====================

  /**
   * Create password reset token
   * @param resetData - Password reset data
   * @returns Promise<boolean> - Success status
   */
  createPasswordResetToken(resetData: PasswordResetData): Promise<boolean>;

  /**
   * Find password reset token
   * @param token - Reset token
   * @returns Promise<PasswordResetData | null> - Reset data or null
   */
  findPasswordResetToken(token: string): Promise<PasswordResetData | null>;

  /**
   * Mark password reset token as used
   * @param token - Reset token
   * @returns Promise<boolean> - Success status
   */
  markPasswordResetTokenUsed(token: string): Promise<boolean>;

  /**
   * Clean up expired password reset tokens
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupExpiredPasswordResetTokens(): Promise<number>;

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Create user session
   * @param sessionData - Session data
   * @returns Promise<boolean> - Success status
   */
  createSession(sessionData: UserSessionData): Promise<boolean>;

  /**
   * Find active session
   * @param sessionId - Session ID
   * @returns Promise<UserSessionData | null> - Session data or null
   */
  findSession(sessionId: string): Promise<UserSessionData | null>;

  /**
   * Find all active sessions for user
   * @param userId - User ID
   * @returns Promise<UserSessionData[]> - Array of user sessions
   */
  findUserSessions(userId: string): Promise<UserSessionData[]>;

  /**
   * Update session last accessed time
   * @param sessionId - Session ID
   * @returns Promise<boolean> - Success status
   */
  updateSessionAccess(sessionId: string): Promise<boolean>;

  /**
   * Revoke session
   * @param sessionId - Session ID
   * @returns Promise<boolean> - Success status
   */
  revokeSession(sessionId: string): Promise<boolean>;

  /**
   * Revoke all sessions for user
   * @param userId - User ID
   * @returns Promise<number> - Number of revoked sessions
   */
  revokeAllUserSessions(userId: string): Promise<number>;

  /**
   * Clean up expired sessions
   * @returns Promise<number> - Number of cleaned sessions
   */
  cleanupExpiredSessions(): Promise<number>;

  // ==================== SECURITY & MONITORING ====================

  /**
   * Record login attempt
   * @param attemptData - Login attempt data
   * @returns Promise<boolean> - Success status
   */
  recordLoginAttempt(attemptData: LoginAttemptData): Promise<boolean>;

  /**
   * Get recent failed login attempts
   * @param email - User email
   * @param timeWindow - Time window in minutes
   * @returns Promise<number> - Number of failed attempts
   */
  getFailedLoginAttempts(email: string, timeWindow: number): Promise<number>;

  /**
   * Lock user account
   * @param lockData - Account lock data
   * @returns Promise<boolean> - Success status
   */
  lockUserAccount(lockData: AccountLockData): Promise<boolean>;

  /**
   * Check if account is locked
   * @param userId - User ID
   * @returns Promise<AccountLockData | null> - Lock data or null
   */
  isAccountLocked(userId: string): Promise<AccountLockData | null>;

  /**
   * Unlock user account
   * @param userId - User ID
   * @returns Promise<boolean> - Success status
   */
  unlockUserAccount(userId: string): Promise<boolean>;

  /**
   * Clean up expired account locks
   * @returns Promise<number> - Number of cleaned locks
   */
  cleanupExpiredAccountLocks(): Promise<number>;
}
