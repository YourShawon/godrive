/**
 * Token Service Interface
 *
 * Defines the contract for JWT token management operations
 * Handles token generation, verification, and storage
 */

import { TokenPayload, TokenPair } from "./auth.service.interface.js";

/**
 * Token Generation Options
 */
export interface TokenGenerationOptions {
  expiresIn?: string; // Token expiration (e.g., '15m', '1h', '7d')
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
