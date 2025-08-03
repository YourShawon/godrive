/**
 * Token Service Implementation
 *
 * Handles JWT token generation, verification, and blacklisting.
 */

import jwt from "jsonwebtoken";
import {
  ITokenService,
  TokenGenerationOptions,
  TokenVerificationResult,
} from "../../interfaces/token.interface.js";
import {
  TokenPayload,
  TokenPair,
} from "../../interfaces/auth.service.interface.js";
import { logger } from "@utils/logger/config.js";

export class TokenService implements ITokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string = "15m";
  private readonly refreshTokenExpiry: string = "7d";
  private readonly blacklistedTokens = new Set<string>(); // In-memory blacklist (use Redis in production)

  constructor() {
    // In production, these should come from environment variables
    this.accessTokenSecret =
      process.env.JWT_ACCESS_SECRET || "your-super-secret-access-key";
    this.refreshTokenSecret =
      process.env.JWT_REFRESH_SECRET || "your-super-secret-refresh-key";

    logger.debug("📦 TokenService instantiated");
  }

  /**
   * Generate access token
   */
  async generateAccessToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    return this.generateToken(payload, "access", options);
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    return this.generateToken(payload, "refresh", options);
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    try {
      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
      };
    } catch (error) {
      logger.error("❌ Token pair generation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        userId: payload.userId,
      });
      throw new Error("Failed to generate token pair");
    }
  }

  /**
   * Generate a single token (internal method)
   */
  private async generateToken(
    payload: TokenPayload,
    type: "access" | "refresh",
    options?: TokenGenerationOptions
  ): Promise<string> {
    try {
      const secret =
        type === "access" ? this.accessTokenSecret : this.refreshTokenSecret;
      const expiresIn =
        options?.expiresIn ||
        (type === "access" ? this.accessTokenExpiry : this.refreshTokenExpiry);

      const tokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const signOptions: any = {
        expiresIn,
        issuer: options?.issuer || "godrive-auth",
        audience: options?.audience || "godrive-app",
        subject: options?.subject || payload.userId,
      };

      const token = jwt.sign(tokenPayload, secret, signOptions);

      return token;
    } catch (error) {
      logger.error("❌ Token generation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        type,
        userId: payload.userId,
      });
      throw new Error(`Failed to generate ${type} token`);
    }
  }

  /**
   * Verify and decode a token
   */
  async verifyToken(
    token: string,
    tokenType: "access" | "refresh"
  ): Promise<TokenVerificationResult> {
    try {
      const secret =
        tokenType === "access"
          ? this.accessTokenSecret
          : this.refreshTokenSecret;

      const decoded = jwt.verify(token, secret, {
        issuer: "godrive-auth",
        audience: "godrive-app",
      }) as TokenPayload;

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      let errorMessage = "Invalid token";
      let expired = false;

      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = "Token expired";
        expired = true;
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = "Invalid token format";
      }

      logger.debug("Token verification failed", {
        error: errorMessage,
        type: tokenType,
      });

      return {
        valid: false,
        error: errorMessage,
        expired,
      };
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch (error) {
      logger.debug("Token decode failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string): string | null {
    if (!authHeader) {
      return null;
    }

    // Handle "Bearer <token>" format
    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer" && parts[1]) {
      return parts[1];
    }

    // Handle direct token (fallback)
    return authHeader;
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Add token to blacklist
   */
  async blacklistToken(token: string, reason?: string): Promise<boolean> {
    this.blacklistedTokens.add(token);

    logger.debug("Token blacklisted", {
      reason: reason || "No reason provided",
      tokenLength: token.length,
    });

    return true;
  }

  /**
   * Clean up expired blacklisted tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    let cleanedCount = 0;

    // Convert Set to Array for easier iteration
    const tokensArray = Array.from(this.blacklistedTokens);

    for (const token of tokensArray) {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        const expirationTime = new Date(decoded.exp * 1000);
        const now = new Date();

        // If token is expired, remove from blacklist
        if (expirationTime < now) {
          this.blacklistedTokens.delete(token);
          cleanedCount++;
        }
      }
    }

    if (cleanedCount > 0) {
      logger.debug("Cleaned up expired blacklisted tokens", {
        cleanedCount,
        remainingCount: this.blacklistedTokens.size,
      });
    }

    return cleanedCount;
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(token: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  }
}
