/**
 * Auth Module Main Export
 *
 * Central export point for the entire auth module.
 * Provides easy access to all auth services and utilities.
 */

// Main Auth Service (this is what most of your app will use)
export {
  authContainer,
  getAuthService,
  getAuthRepository,
  getRefreshTokenRepository,
  getTokenService,
  getPasswordService,
  getValidationService,
  initializeAuthModule,
} from "./auth.container.js";

// Interfaces (for TypeScript support)
export type { IAuthService } from "./interfaces/auth.service.interface.js";
export type { IAuthRepository } from "./repositories/interfaces/auth.repository.interface.js";
export type { IRefreshTokenRepository } from "./repositories/interfaces/refreshToken.repository.interface.js";
export type { ITokenService } from "./interfaces/token.interface.js";
export type { IPasswordService } from "./interfaces/password.service.interface.js";
export type { IValidationService } from "./interfaces/validation.service.interface.js";

// Auth Service Types
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ChangePasswordRequest,
  TokenPayload,
} from "./interfaces/auth.service.interface.js";

// Error Classes
export { AuthenticationError } from "./errors/AuthenticationError.js";
export { ValidationError } from "./errors/ValidationError.js";

// Routes (will be created next)
export { authRoutes } from "./auth.routes.js";

/**
 * Example Usage:
 *
 * // In your app initialization
 * import { initializeAuthModule } from '@modules/auth';
 * await initializeAuthModule();
 *
 * // In your controllers
 * import { getAuthService } from '@modules/auth';
 * const authService = getAuthService();
 * const result = await authService.login(loginData);
 *
 * // In your middleware
 * import { getAuthService } from '@modules/auth';
 * const authService = getAuthService();
 * const tokenPayload = await authService.validateToken(token);
 */
