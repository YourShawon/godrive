/**
 * Token Generator - JWT Token Creation
 *
 * Handles JWT token generation for access and refresh tokens
 * Single Responsibility: Token creation with proper configuration
 */

import * as jwt from "jsonwebtoken";
import { logger } from "../../../../../utils/logger/config.js";
import { jwtConfig, TOKEN_EXPIRY } from "../../../config/jwt.config.js";
import { TokenGenerationOptions } from "../../../interfaces/token.interface.js";
import {
  TokenPayload,
  TokenPair,
} from "../../../interfaces/auth.service.interface.js";

export class TokenGenerator {
  constructor() {
    logger.debug("🔐 TokenGenerator initialized", {
      module: "TokenGenerator",
      action: "constructor",
    });
  }

  /**
   * Generate access token
   */
  async generateAccessToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    const requestId = `generateAccessToken_${Date.now()}_${payload.userId}`;
    const startTime = Date.now();

    logger.debug("🔐 [TokenGenerator] Generating access token", {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      requestId,
      module: "TokenGenerator",
      action: "generateAccessToken_start",
    });

    try {
      const tokenPayload: TokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const expiresIn = options?.expiresIn || jwtConfig.accessToken.expiresIn;
      const signOptions: any = {
        expiresIn,
        algorithm: jwtConfig.accessToken.algorithm as jwt.Algorithm,
        issuer: options?.issuer || jwtConfig.accessToken.issuer,
        audience: options?.audience || jwtConfig.accessToken.audience,
        subject: options?.subject || payload.userId,
      };

      const token = jwt.sign(
        tokenPayload,
        jwtConfig.accessToken.secret,
        signOptions
      );

      const duration = Date.now() - startTime;

      logger.info("✅ [TokenGenerator] Access token generated", {
        userId: payload.userId,
        expiresIn: signOptions.expiresIn,
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateAccessToken_success",
      });

      return token;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [TokenGenerator] Access token generation failed", {
        userId: payload.userId,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateAccessToken_error",
      });

      throw new Error(
        `Failed to generate access token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate refresh token
   */
  async generateRefreshToken(
    payload: TokenPayload,
    options?: TokenGenerationOptions
  ): Promise<string> {
    const requestId = `generateRefreshToken_${Date.now()}_${payload.userId}`;
    const startTime = Date.now();

    logger.debug("🔐 [TokenGenerator] Generating refresh token", {
      userId: payload.userId,
      email: payload.email,
      requestId,
      module: "TokenGenerator",
      action: "generateRefreshToken_start",
    });

    try {
      const tokenPayload: TokenPayload = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      const expiresIn = options?.expiresIn || jwtConfig.refreshToken.expiresIn;
      const signOptions: any = {
        expiresIn,
        algorithm: jwtConfig.refreshToken.algorithm as jwt.Algorithm,
        issuer: options?.issuer || jwtConfig.refreshToken.issuer,
        audience: options?.audience || jwtConfig.refreshToken.audience,
        subject: options?.subject || payload.userId,
      };

      const token = jwt.sign(
        tokenPayload,
        jwtConfig.refreshToken.secret,
        signOptions
      );

      const duration = Date.now() - startTime;

      logger.info("✅ [TokenGenerator] Refresh token generated", {
        userId: payload.userId,
        expiresIn: signOptions.expiresIn,
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateRefreshToken_success",
      });

      return token;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [TokenGenerator] Refresh token generation failed", {
        userId: payload.userId,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateRefreshToken_error",
      });

      throw new Error(
        `Failed to generate refresh token: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  async generateTokenPair(payload: TokenPayload): Promise<TokenPair> {
    const requestId = `generateTokenPair_${Date.now()}_${payload.userId}`;
    const startTime = Date.now();

    logger.debug("🔐 [TokenGenerator] Generating token pair", {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      requestId,
      module: "TokenGenerator",
      action: "generateTokenPair_start",
    });

    try {
      // Generate both tokens in parallel for better performance
      const [accessToken, refreshToken] = await Promise.all([
        this.generateAccessToken(payload),
        this.generateRefreshToken(payload),
      ]);

      const tokenPair: TokenPair = {
        accessToken,
        refreshToken,
        expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
      };

      const duration = Date.now() - startTime;

      logger.info("✅ [TokenGenerator] Token pair generated", {
        userId: payload.userId,
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateTokenPair_success",
      });

      return tokenPair;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [TokenGenerator] Token pair generation failed", {
        userId: payload.userId,
        error: error instanceof Error ? error.message : "Unknown error",
        duration: `${duration}ms`,
        requestId,
        module: "TokenGenerator",
        action: "generateTokenPair_error",
      });

      throw error; // Re-throw the original error (already formatted)
    }
  }
}
