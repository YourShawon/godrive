/**
 * Auth Service Orchestrator
 *
 * Main coordinator that delegates authentication operations to specialized services:
 * - UserAuthService: Registration & Login
 * - TokenAuthService: Token management & validation
 * - PasswordAuthService: Password operations
 *
 * This provides a unified interface while maintaining separation of concerns.
 */

import { logger } from "@utils/logger/config.js";
import {
  IAuthService,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ChangePasswordRequest,
  TokenPayload,
} from "../../interfaces/auth.service.interface.js";
import { UserAuthService } from "./user-auth.service.js";
import { TokenAuthService } from "./token-auth.service.js";
import { PasswordAuthService } from "./password-auth.service.js";

export class AuthService implements IAuthService {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly tokenAuthService: TokenAuthService,
    private readonly passwordAuthService: PasswordAuthService
  ) {
    logger.info("🎯 AuthService orchestrator initialized", {
      module: "AuthService",
      action: "constructor",
    });
  }

  // ==================== DELEGATION METHODS ====================

  /**
   * Delegate user registration to UserAuthService
   */
  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    return await this.userAuthService.register(registerData);
  }

  /**
   * Delegate user login to UserAuthService
   */
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    return await this.userAuthService.login(loginData);
  }

  /**
   * Delegate token refresh to TokenAuthService
   */
  async refreshToken(
    refreshData: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    return await this.tokenAuthService.refreshToken(refreshData);
  }

  /**
   * Delegate token validation to TokenAuthService
   */
  async validateToken(token: string): Promise<TokenPayload | null> {
    return await this.tokenAuthService.validateToken(token);
  }

  /**
   * Delegate user logout to TokenAuthService
   */
  async logout(
    logoutData: LogoutRequest
  ): Promise<{ success: boolean; message: string }> {
    return await this.tokenAuthService.logout(logoutData);
  }

  /**
   * Delegate password change to PasswordAuthService
   */
  async changePassword(
    changePasswordData: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    return await this.passwordAuthService.changePassword(changePasswordData);
  }

  // ==================== ADDITIONAL UTILITY METHODS ====================

  /**
   * Revoke all user tokens (useful for security incidents)
   */
  async revokeAllUserTokens(userId: string, reason: string): Promise<void> {
    return await this.tokenAuthService.revokeAllUserTokens(userId, reason);
  }

  /**
   * Validate password strength
   */
  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    errors: string[];
    score: number;
  }> {
    return await this.passwordAuthService.validatePasswordStrength(password);
  }
}
