/**
 * Token Service Interface
 *
 * Defines the contract for JWT token management operations
 * Handles token generation, verification, and storage
 */

import {
  TokenPayload,
  TokenPair,
  RefreshTokenData,
} from "./auth.service.interface.js";

/**
 * Token Generation Options
 */
export interface TokenGenerationOptions {
  expiresIn?: string | number; // Token expiration (e.g., '15m', 3600)
  audience?: string; // Token audience
  issuer?: string; // Token issuer
  subject?: string; // Token subject
}

/**
 * Token Verification Result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  error?: string;
  expired?: boolean;
}

/**
 * Token Service Interface
 * Handles all JWT token operations
 */
export interface ITokenService {
  /**
   * Generate access token
   * @param payload - Token payload (user data)
   * @param options - Token generation options
   * @returns Promise<string> - JWT access token
   */
  generateAccessToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string>;

  /**
   * Generate refresh token
   * @param payload - Token payload (user data)
   * @param options - Token generation options
   * @returns Promise<string> - JWT refresh token
   */
  generateRefreshToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string>;

  /**
   * Generate token pair (access + refresh)
   * @param payload - Token payload (user data)
   * @returns Promise<TokenPair> - Access and refresh tokens
   */
  generateTokenPair(payload: TokenPayload): Promise<TokenPair>;

  /**
   * Verify and decode JWT token
   * @param token - JWT token to verify
   * @param tokenType - Type of token ('access' | 'refresh')
   * @returns Promise<TokenVerificationResult> - Verification result
   */
  verifyToken(
    token: string,
    tokenType: "access" | "refresh"
  ): Promise<TokenVerificationResult>;

  /**
   * Decode JWT token without verification (for debugging)
   * @param token - JWT token to decode
   * @returns TokenPayload | null - Decoded payload or null
   */
  decodeToken(token: string): TokenPayload | null;

  /**
   * Extract token from Authorization header
   * @param authHeader - Authorization header value
   * @returns string | null - Extracted token or null
   */
  extractTokenFromHeader(authHeader: string): string | null;

  /**
   * Check if token is blacklisted
   * @param token - JWT token to check
   * @returns Promise<boolean> - Blacklist status
   */
  isTokenBlacklisted(token: string): Promise<boolean>;

  /**
   * Add token to blacklist
   * @param token - JWT token to blacklist
   * @param reason - Reason for blacklisting
   * @returns Promise<boolean> - Success status
   */
  blacklistToken(token: string, reason?: string): Promise<boolean>;

  /**
   * Clean up expired blacklisted tokens
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupExpiredTokens(): Promise<number>;
}

/**
 * Refresh Token Repository Interface
 * Handles refresh token storage and management
 */
export interface IRefreshTokenRepository {
  /**
   * Store refresh token
   * @param tokenData - Refresh token data
   * @returns Promise<boolean> - Success status
   */
  storeRefreshToken(tokenData: RefreshTokenData): Promise<boolean>;

  /**
   * Find refresh token by token value
   * @param token - Refresh token value
   * @returns Promise<RefreshTokenData | null> - Token data or null
   */
  findRefreshToken(token: string): Promise<RefreshTokenData | null>;

  /**
   * Find all refresh tokens for user
   * @param userId - User ID
   * @returns Promise<RefreshTokenData[]> - Array of user's refresh tokens
   */
  findUserRefreshTokens(userId: string): Promise<RefreshTokenData[]>;

  /**
   * Revoke refresh token
   * @param tokenId - Token ID to revoke
   * @returns Promise<boolean> - Success status
   */
  revokeRefreshToken(tokenId: string): Promise<boolean>;

  /**
   * Revoke all refresh tokens for user
   * @param userId - User ID
   * @returns Promise<number> - Number of revoked tokens
   */
  revokeAllUserTokens(userId: string): Promise<number>;

  /**
   * Clean up expired refresh tokens
   * @returns Promise<number> - Number of cleaned tokens
   */
  cleanupExpiredRefreshTokens(): Promise<number>;

  /**
   * Update refresh token last used timestamp
   * @param tokenId - Token ID
   * @returns Promise<boolean> - Success status
   */
  updateTokenLastUsed(tokenId: string): Promise<boolean>;
}
