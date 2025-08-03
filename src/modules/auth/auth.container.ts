/**
 * Auth Module Dependency Injection Container
 *
 * Responsible for creating and configuring all auth-related services
 * with proper dependency injection.
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "@utils/logger/config.js";
import { AuthService } from "./services/implementations/auth.service.js";
import { AuthRepository } from "./repositories/implementations/auth.repository.js";
import { RefreshTokenRepository } from "./repositories/implementations/refreshToken.repository.js";
import { TokenService } from "./services/implementations/token.service.js";
import { PasswordService } from "./services/implementations/password.service.js";
import { ValidationService } from "./services/implementations/validation.service.js";

// Specialized Auth Services
import { UserAuthService } from "./services/implementations/user-auth.service.js";
import { TokenAuthService } from "./services/implementations/token-auth.service.js";
import { PasswordAuthService } from "./services/implementations/password-auth.service.js";

import type { IAuthService } from "./interfaces/auth.service.interface.js";
import type { IAuthRepository } from "./repositories/interfaces/auth.repository.interface.js";
import type { IRefreshTokenRepository } from "./repositories/interfaces/refreshToken.repository.interface.js";
import type { ITokenService } from "./interfaces/token.interface.js";
import type { IPasswordService } from "./interfaces/password.service.interface.js";
import type { IValidationService } from "./interfaces/validation.service.interface.js";

/**
 * Auth Module Container
 *
 * Provides singleton instances of all auth services with proper dependency injection.
 */
class AuthContainer {
  private static instance: AuthContainer;
  private readonly prisma: PrismaClient;

  // Service instances
  private _authRepository?: IAuthRepository | undefined;
  private _refreshTokenRepository?: IRefreshTokenRepository | undefined;
  private _tokenService?: ITokenService | undefined;
  private _passwordService?: IPasswordService | undefined;
  private _validationService?: IValidationService | undefined;

  // Specialized Auth Services
  private _userAuthService?: UserAuthService | undefined;
  private _tokenAuthService?: TokenAuthService | undefined;
  private _passwordAuthService?: PasswordAuthService | undefined;

  // Main Auth Service
  private _authService?: IAuthService | undefined;

  private constructor() {
    this.prisma = new PrismaClient();
    logger.info("🏗️ AuthContainer initialized", {
      module: "AuthContainer",
      action: "constructor",
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthContainer {
    if (!AuthContainer.instance) {
      AuthContainer.instance = new AuthContainer();
    }
    return AuthContainer.instance;
  }

  // ==================== REPOSITORY GETTERS ====================

  /**
   * Get Auth Repository
   */
  public getAuthRepository(): IAuthRepository {
    if (!this._authRepository) {
      this._authRepository = new AuthRepository(this.prisma);
      logger.debug("📦 AuthRepository instantiated");
    }
    return this._authRepository;
  }

  /**
   * Get Refresh Token Repository
   */
  public getRefreshTokenRepository(): IRefreshTokenRepository {
    if (!this._refreshTokenRepository) {
      this._refreshTokenRepository = new RefreshTokenRepository(this.prisma);
      logger.debug("📦 RefreshTokenRepository instantiated");
    }
    return this._refreshTokenRepository;
  }

  // ==================== SERVICE GETTERS ====================

  /**
   * Get Password Service
   */
  public getPasswordService(): IPasswordService {
    if (!this._passwordService) {
      this._passwordService = new PasswordService();
      logger.debug("📦 PasswordService instantiated");
    }
    return this._passwordService;
  }

  /**
   * Get Validation Service
   */
  public getValidationService(): IValidationService {
    if (!this._validationService) {
      this._validationService = new ValidationService();
      logger.debug("📦 ValidationService instantiated");
    }
    return this._validationService;
  }

  /**
   * Get Token Service
   */
  public getTokenService(): ITokenService {
    if (!this._tokenService) {
      this._tokenService = new TokenService();
      logger.debug("📦 TokenService instantiated");
    }
    return this._tokenService;
  }

  /**
   * Get Main Auth Service (with all dependencies injected)
   */
  public getAuthService(): IAuthService {
    if (!this._authService) {
      const userAuthService = this.getUserAuthService();
      const tokenAuthService = this.getTokenAuthService();
      const passwordAuthService = this.getPasswordAuthService();

      this._authService = new AuthService(
        userAuthService,
        tokenAuthService,
        passwordAuthService
      );

      logger.info("🎯 Main AuthService orchestrator instantiated", {
        module: "AuthContainer",
        specialized_services: [
          "UserAuthService",
          "TokenAuthService",
          "PasswordAuthService",
        ],
      });
    }
    return this._authService;
  }

  /**
   * Get User Auth Service (handles registration & login)
   */
  public getUserAuthService(): UserAuthService {
    if (!this._userAuthService) {
      const authRepository = this.getAuthRepository();
      const refreshTokenRepository = this.getRefreshTokenRepository();
      const tokenService = this.getTokenService();
      const passwordService = this.getPasswordService();
      const validationService = this.getValidationService();

      this._userAuthService = new UserAuthService(
        authRepository,
        refreshTokenRepository,
        tokenService,
        passwordService,
        validationService
      );

      logger.debug("� UserAuthService instantiated");
    }
    return this._userAuthService;
  }

  /**
   * Get Token Auth Service (handles token operations)
   */
  public getTokenAuthService(): TokenAuthService {
    if (!this._tokenAuthService) {
      const authRepository = this.getAuthRepository();
      const refreshTokenRepository = this.getRefreshTokenRepository();
      const tokenService = this.getTokenService();
      const passwordService = this.getPasswordService();

      this._tokenAuthService = new TokenAuthService(
        authRepository,
        refreshTokenRepository,
        tokenService,
        passwordService
      );

      logger.debug("🎫 TokenAuthService instantiated");
    }
    return this._tokenAuthService;
  }

  /**
   * Get Password Auth Service (handles password operations)
   */
  public getPasswordAuthService(): PasswordAuthService {
    if (!this._passwordAuthService) {
      const authRepository = this.getAuthRepository();
      const refreshTokenRepository = this.getRefreshTokenRepository();
      const passwordService = this.getPasswordService();
      const validationService = this.getValidationService();

      this._passwordAuthService = new PasswordAuthService(
        authRepository,
        refreshTokenRepository,
        passwordService,
        validationService
      );

      logger.debug("🔐 PasswordAuthService instantiated");
    }
    return this._passwordAuthService;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Reset all instances (useful for testing)
   */
  public reset(): void {
    this._authRepository = undefined;
    this._refreshTokenRepository = undefined;
    this._tokenService = undefined;
    this._passwordService = undefined;
    this._validationService = undefined;
    this._authService = undefined;

    logger.debug("🔄 AuthContainer reset - all instances cleared");
  }

  /**
   * Get container health status
   */
  public getHealthStatus(): {
    isHealthy: boolean;
    services: Record<string, boolean>;
  } {
    const services = {
      authRepository: !!this._authRepository,
      refreshTokenRepository: !!this._refreshTokenRepository,
      tokenService: !!this._tokenService,
      passwordService: !!this._passwordService,
      validationService: !!this._validationService,
      authService: !!this._authService,
    };

    const isHealthy = Object.values(services).some(
      (isInitialized) => isInitialized
    );

    return {
      isHealthy,
      services,
    };
  }
}

// Export singleton instance
export const authContainer = AuthContainer.getInstance();

// Export individual service getters for convenience
export const getAuthService = () => authContainer.getAuthService();
export const getAuthRepository = () => authContainer.getAuthRepository();
export const getRefreshTokenRepository = () =>
  authContainer.getRefreshTokenRepository();
export const getTokenService = () => authContainer.getTokenService();
export const getPasswordService = () => authContainer.getPasswordService();
export const getValidationService = () => authContainer.getValidationService();

/**
 * Initialize all auth services
 * Call this during application startup
 */
export async function initializeAuthModule(): Promise<void> {
  try {
    logger.info("🚀 Initializing Auth Module...", {
      module: "AuthContainer",
      action: "initialize",
    });

    // Pre-instantiate core services
    authContainer.getPasswordService();
    authContainer.getValidationService();
    authContainer.getTokenService();
    authContainer.getAuthRepository();
    authContainer.getRefreshTokenRepository();

    // Initialize main auth service
    authContainer.getAuthService();

    const healthStatus = authContainer.getHealthStatus();

    logger.info("✅ Auth Module initialized successfully", {
      module: "AuthContainer",
      action: "initialize",
      healthStatus,
    });
  } catch (error) {
    logger.error("❌ Failed to initialize Auth Module", {
      module: "AuthContainer",
      action: "initialize",
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
