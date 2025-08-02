/**
 * Token Verifier - JWT Token Validation
 *
 * Handles JWT token verification and decoding
 * Single Responsibility: Token validation and security checks
 */

import * as jwt from "jsonwebtoken";
import { logger } from "../../../../../utils/logger/config.js";
import { jwtConfig } from "../../../config/jwt.config.js";
import { TokenVerificationResult } from "../../../interfaces/token.interface.js";
import { TokenPayload } from "../../../interfaces/auth.service.interface.js";

export class TokenVerifier {
  constructor() {
    logger.debug("🔐 TokenVerifier initialized", {
      module: "TokenVerifier",
      action: "constructor",
    });
  }

  /**
   * Verify and decode JWT token
   */
  async verifyToken(
    token: string,
    tokenType: "access" | "refresh",
    isBlacklisted: boolean = false
  ): Promise<TokenVerificationResult> {
    const requestId = `verifyToken_${Date.now()}_${tokenType}`;
    const startTime = Date.now();

    logger.debug("🔐 [TokenVerifier] Verifying token", {
      tokenType,
      isBlacklisted,
      requestId,
      module: "TokenVerifier",
      action: "verifyToken_start",
    });

    try {
      // Check if token is blacklisted
      if (isBlacklisted) {
        logger.warn("⚠️ [TokenVerifier] Token is blacklisted", {
          tokenType,
          requestId,
          module: "TokenVerifier",
          action: "verifyToken_blacklisted",
        });

        return {
          valid: false,
          error: "Token has been blacklisted",
        };
      }

      const secret =
        tokenType === "access"
          ? jwtConfig.accessToken.secret
          : jwtConfig.refreshToken.secret;

      const config =
        tokenType === "access" ? jwtConfig.accessToken : jwtConfig.refreshToken;

      const verifyOptions: jwt.VerifyOptions = {
        algorithms: [config.algorithm as jwt.Algorithm],
        issuer: config.issuer,
        audience: config.audience,
      };

      const decoded = jwt.verify(token, secret, verifyOptions) as TokenPayload;

      const duration = Date.now() - startTime;

      logger.info("✅ [TokenVerifier] Token verified successfully", {
        userId: decoded.userId,
        tokenType,
        duration: `${duration}ms`,
        requestId,
        module: "TokenVerifier",
        action: "verifyToken_success",
      });

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle specific JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        logger.warn("⚠️ [TokenVerifier] Token expired", {
          tokenType,
          error: error.message,
          duration: `${duration}ms`,
          requestId,
          module: "TokenVerifier",
          action: "verifyToken_expired",
        });

        return {
          valid: false,
          error: "Token has expired",
          expired: true,
        };
      }

      if (error instanceof jwt.JsonWebTokenError) {
        logger.warn("⚠️ [TokenVerifier] Invalid token", {
          tokenType,
          error: error.message,
          duration: `${duration}ms`,
          requestId,
          module: "TokenVerifier",
          action: "verifyToken_invalid",
        });

        return {
          valid: false,
          error: `Invalid token: ${error.message}`,
        };
      }

      logger.error("❌ [TokenVerifier] Token verification failed", {
        tokenType,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
        requestId,
        module: "TokenVerifier",
        action: "verifyToken_error",
      });

      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Token verification failed",
      };
    }
  }

  /**
   * Decode JWT token without verification (for debugging)
   */
  decodeToken(token: string): TokenPayload | null {
    const requestId = `decodeToken_${Date.now()}`;

    logger.debug("🔐 [TokenVerifier] Decoding token", {
      requestId,
      module: "TokenVerifier",
      action: "decodeToken_start",
    });

    try {
      const decoded = jwt.decode(token) as TokenPayload;

      logger.debug("✅ [TokenVerifier] Token decoded successfully", {
        userId: decoded?.userId,
        requestId,
        module: "TokenVerifier",
        action: "decodeToken_success",
      });

      return decoded;
    } catch (error) {
      logger.warn("⚠️ [TokenVerifier] Token decode failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "TokenVerifier",
        action: "decodeToken_failed",
      });
      return null;
    }
  }

  /**
   * Extract user ID from token without full verification
   */
  extractUserId(token: string): string | null {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.userId || null;
    } catch (error) {
      logger.warn("⚠️ [TokenVerifier] Failed to extract user ID", {
        error: error instanceof Error ? error.message : "Unknown error",
        module: "TokenVerifier",
        action: "extractUserId_failed",
      });
      return null;
    }
  }

  /**
   * Check if token is expired without verification
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      logger.warn("⚠️ [TokenVerifier] Failed to check token expiration", {
        error: error instanceof Error ? error.message : "Unknown error",
        module: "TokenVerifier",
        action: "isTokenExpired_failed",
      });
      return true; // Assume expired if we can't decode
    }
  }
}
