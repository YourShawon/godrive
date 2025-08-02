/**
 * Token Management Service - JWT Token Operations Orchestrator
 *
 * Orchestrates JWT token operations using modular components
 * Implements ITokenService interface with security best practices
 *
 * Single Responsibility: Coordinate token operations between specialized modules
 */

import { logger } from "../../../../utils/logger/config.js";
import { validateJWTConfig } from "../../config/jwt.config.js";
import {
  ITokenService,
  TokenGenerationOptions,
  TokenVerificationResult,
} from "../../interfaces/token.interface.js";
import {
  TokenPayload,
  TokenPair,
} from "../../interfaces/auth.service.interface.js";

// Import modular components
import { TokenGenerator } from "./token/tokenGenerator.js";
import { TokenVerifier } from "./token/tokenVerifier.js";
import { TokenBlacklist } from "./token/tokenBlacklist.js";
import { TokenExtractor } from "./token/tokenExtractor.js";

export class TokenManagementService implements ITokenService {
  private generator: TokenGenerator;
  private verifier: TokenVerifier;
  private blacklist: TokenBlacklist;
  private extractor: TokenExtractor;

  constructor() {
    // Validate JWT configuration on initialization
    validateJWTConfig();

    // Initialize modular components
    this.generator = new TokenGenerator();
    this.verifier = new TokenVerifier();
    this.blacklist = new TokenBlacklist();
    this.extractor = new TokenExtractor();

    logger.info("🔐 TokenManagementService initialized", {
      module: "TokenManagementService",
      action: "constructor",
      components: [
        "TokenGenerator",
        "TokenVerifier",
        "TokenBlacklist",
        "TokenExtractor",
      ],
    });
  }

  // ==================== TOKEN GENERATION ====================

  /**
   * Generate access token
   */
  async generateAccessToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    return this.generator.generateAccessToken(payload, options);
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    return this.generator.generateRefreshToken(payload, options);
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    return this.generator.generateTokenPair(payload);
  }

  // ==================== TOKEN VERIFICATION ====================

  /**
   * Verify and decode JWT token
   */
  async verifyToken(
    token: string,
    tokenType: "access" | "refresh"
  ): Promise<TokenVerificationResult> {
    const isBlacklisted = await this.blacklist.isTokenBlacklisted(token);
    return this.verifier.verifyToken(token, tokenType, isBlacklisted);
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  decodeToken(token: string): TokenPayload | null {
    return this.verifier.decodeToken(token);
  }

  /**
   * Extract user ID from token without full verification
   */
  extractUserId(token: string): string | null {
    return this.verifier.extractUserId(token);
  }

  /**
   * Check if token is expired without verification
   */
  isTokenExpired(token: string): boolean {
    return this.verifier.isTokenExpired(token);
  }

  // ==================== TOKEN EXTRACTION ====================

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    return this.extractor.extractTokenFromHeader(authHeader);
  }

  /**
   * Extract token from cookie
   */
  extractTokenFromCookie(cookies: string, cookieName?: string): string | null {
    return this.extractor.extractTokenFromCookie(cookies, cookieName);
  }

  /**
   * Extract token from query parameter
   */
  extractTokenFromQuery(
    queryString: string,
    paramName?: string
  ): string | null {
    return this.extractor.extractTokenFromQuery(queryString, paramName);
  }

  /**
   * Extract token from multiple sources (priority order)
   */
  extractToken(sources: {
    authHeader?: string;
    cookies?: string;
    query?: string;
    cookieName?: string;
    queryParam?: string;
  }): { token: string | null; source: string | null } {
    return this.extractor.extractToken(sources);
  }

  // ==================== TOKEN BLACKLISTING ====================

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklist.isTokenBlacklisted(token);
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(token: string, reason?: string): Promise<boolean> {
    return this.blacklist.blacklistToken(token, reason);
  }

  /**
   * Remove token from blacklist (unrevoke)
   */
  async removeFromBlacklist(token: string, reason?: string): Promise<boolean> {
    return this.blacklist.removeFromBlacklist(token, reason);
  }

  /**
   * Clear all blacklisted tokens
   */
  async clearBlacklist(): Promise<number> {
    return this.blacklist.clearBlacklist();
  }

  /**
   * Get blacklist statistics
   */
  getBlacklistStats(): { size: number; memoryUsage: string } {
    return this.blacklist.getBlacklistStats();
  }

  /**
   * Clean up expired blacklisted tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    return this.blacklist.cleanupExpiredTokens();
  }
}
