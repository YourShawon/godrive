/**
 * Token Authentication Service
 *
 * Handles token refresh, validation, and blacklisting operations.
 * Focused on token lifecycle management.
 */

import { logger } from "@utils/logger/config.js";
import {
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  TokenPayload,
} from "../../interfaces/auth.service.interface.js";
import { IAuthRepository } from "../../repositories/interfaces/auth.repository.interface.js";
import { IRefreshTokenRepository } from "../../repositories/interfaces/refreshToken.repository.interface.js";
import { ITokenService } from "../../interfaces/token.interface.js";
import { IPasswordService } from "../../interfaces/password.service.interface.js";
import { AuthenticationError } from "../../errors/AuthenticationError.js";
import { AuthServiceUtils } from "./auth-service.utils.js";

export class TokenAuthService {
  private readonly utils: AuthServiceUtils;

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly tokenService: ITokenService,
    private readonly passwordService: IPasswordService
  ) {
    this.utils = new AuthServiceUtils(passwordService);
    logger.debug("🎫 TokenAuthService initialized");
  }

  // ==================== TOKEN REFRESH ====================

  async refreshToken(
    refreshData: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const requestId = AuthServiceUtils.generateRequestId("refresh");

    AuthServiceUtils.logOperationStart(
      "TokenAuthService",
      "Token refresh",
      {},
      requestId
    );

    return AuthServiceUtils.executeWithErrorHandling(
      "TokenAuthService",
      "Token refresh",
      async () => {
        // Verify and validate refresh token
        const tokenPayload = await this.verifyRefreshToken(
          refreshData.refreshToken
        );

        // Get user data
        const user = await this.authRepository.findUserById(
          tokenPayload.userId
        );
        if (!user) {
          throw new AuthenticationError("User not found");
        }

        // Generate new tokens
        const newTokens = await this.tokenService.generateTokenPair({
          userId: user.id,
          email: user.email,
          role: user.role,
        });

        // Rotate refresh token (security best practice)
        await this.rotateRefreshToken(refreshData, newTokens.refreshToken);

        AuthServiceUtils.logSuccess(
          "TokenAuthService",
          "Token refresh",
          {
            userId: user.id,
          },
          requestId
        );

        return {
          success: true,
          message: "Token refreshed successfully",
          tokens: newTokens,
        };
      },
      requestId
    );
  }

  // ==================== TOKEN VALIDATION ====================

  async validateToken(token: string): Promise<TokenPayload | null> {
    try {
      const verification = await this.tokenService.verifyToken(token, "access");

      if (!verification.valid || !verification.payload) {
        return null;
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.tokenService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return null;
      }

      return verification.payload;
    } catch (error) {
      logger.debug("Token validation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }

  // ==================== USER LOGOUT ====================

  async logout(
    logoutData: LogoutRequest
  ): Promise<{ success: boolean; message: string }> {
    const requestId = `logout_${Date.now()}`;

    logger.info("🚪 [TokenAuthService] User logout started", {
      userId: logoutData.userId,
      requestId,
    });

    try {
      // Revoke refresh token if provided
      if (logoutData.refreshToken) {
        await this.revokeRefreshToken(logoutData.refreshToken, "User logout");
      }

      // Blacklist access token if provided
      if (logoutData.accessToken) {
        await this.tokenService.blacklistToken(
          logoutData.accessToken,
          "User logout"
        );
      }

      // Handle logout from all devices
      if (logoutData.logoutFromAllDevices) {
        await this.refreshTokenRepository.revokeAllUserTokens(
          logoutData.userId,
          "Logout from all devices"
        );
      }

      logger.info("✅ [TokenAuthService] User logged out successfully", {
        userId: logoutData.userId,
        logoutFromAllDevices: logoutData.logoutFromAllDevices,
        requestId,
      });

      return {
        success: true,
        message: logoutData.logoutFromAllDevices
          ? "Logged out from all devices successfully"
          : "Logged out successfully",
      };
    } catch (error) {
      logger.error("❌ [TokenAuthService] Logout failed", {
        userId: logoutData.userId,
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
      });
      throw error;
    }
  }

  // ==================== SECURITY OPERATIONS ====================

  async revokeAllUserTokens(userId: string, reason: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(userId, reason);
    logger.info("🔒 [TokenAuthService] All user tokens revoked", {
      userId,
      reason,
    });
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async verifyRefreshToken(
    refreshToken: string
  ): Promise<TokenPayload> {
    // Verify token signature and expiration
    const tokenVerification = await this.tokenService.verifyToken(
      refreshToken,
      "refresh"
    );

    if (!tokenVerification.valid || !tokenVerification.payload) {
      throw new AuthenticationError("Invalid refresh token");
    }

    // Check if token exists in database and is not revoked
    const tokenHash = await this.utils.hashToken(refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken || storedToken.isRevoked) {
      throw new AuthenticationError("Refresh token has been revoked");
    }

    return tokenVerification.payload;
  }

  private async rotateRefreshToken(
    refreshData: RefreshTokenRequest,
    newRefreshToken: string
  ): Promise<void> {
    const oldTokenHash = await this.utils.hashToken(refreshData.refreshToken);
    const storedToken =
      await this.refreshTokenRepository.findRefreshTokenByHash(oldTokenHash);

    if (!storedToken) {
      throw new AuthenticationError("Original refresh token not found");
    }

    await this.refreshTokenRepository.rotateRefreshToken({
      oldTokenId: storedToken.tokenId,
      newTokenData: {
        userId: storedToken.userId,
        tokenHash: await this.utils.hashToken(newRefreshToken),
        deviceInfo: refreshData.deviceInfo || "Unknown Device",
        ipAddress: refreshData.ipAddress || "Unknown IP",
        userAgent: refreshData.userAgent || "Unknown User Agent",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      rotationReason: "Token refresh",
    });
  }

  private async revokeRefreshToken(
    refreshToken: string,
    reason: string
  ): Promise<void> {
    const tokenHash = await this.utils.hashToken(refreshToken);
    await this.refreshTokenRepository.revokeRefreshTokenByHash(
      tokenHash,
      reason
    );
  }
}
