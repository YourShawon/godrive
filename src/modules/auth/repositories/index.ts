/**
 * Auth Repositories Export
 *
 * Central export file for all authentication repository interfaces and implementations
 * Provides easy import for services and dependency injection
 */

// Repository Interfaces
export type {
  IAuthRepository,
  LoginCredentials,
  UserRegistrationData,
  PasswordResetData,
  UserSessionData,
  AccountVerificationData,
  LoginAttemptData,
  AccountLockData,
} from "./interfaces/auth.repository.interface.js";

export type {
  IRefreshTokenRepository,
  RefreshTokenData,
  RefreshTokenCreationData,
  TokenRotationData,
  TokenStatistics,
} from "./interfaces/refreshToken.repository.interface.js";

// Repository Implementations
export { AuthRepository } from "./implementations/auth.repository.js";
export { RefreshTokenRepository } from "./implementations/refreshToken.repository.js";
