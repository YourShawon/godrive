/**
 * Auth Module Error Exports
 *
 * Central export file for all authentication-related errors
 * Provides easy import for controllers and services
 */

// Re-export ServiceError from user module for consistency
export { ServiceError } from "../../user/errors/user.service.errors.js";

// Authentication Errors
export {
  AuthenticationError,
  InvalidCredentialsError,
  AccountNotFoundError,
  AccountDisabledError,
} from "./AuthenticationError.js";

// Token Errors
export {
  TokenError,
  TokenExpiredError,
  InvalidTokenError,
  TokenNotProvidedError,
  TokenBlacklistedError,
  RefreshTokenNotFoundError,
} from "./TokenError.js";

// Security Errors
export {
  SecurityError,
  AccountLockedError,
  RateLimitExceededError,
  InsufficientPermissionsError,
  EmailNotVerifiedError,
  SessionExpiredError,
} from "./SecurityError.js";

// Password Reset Errors
export {
  PasswordResetError,
  InvalidResetTokenError,
  ResetTokenExpiredError,
  ResetTokenUsedError,
  TooManyResetRequestsError,
  PasswordResetEmailFailedError,
} from "./PasswordResetError.js";

// Import base classes for type guards
import { AuthenticationError } from "./AuthenticationError.js";
import { TokenError } from "./TokenError.js";
import { SecurityError } from "./SecurityError.js";
import { PasswordResetError } from "./PasswordResetError.js";

/**
 * Type guard to check if error is an auth-related error
 */
export function isAuthError(
  error: any
): error is
  | AuthenticationError
  | TokenError
  | SecurityError
  | PasswordResetError {
  return (
    error instanceof AuthenticationError ||
    error instanceof TokenError ||
    error instanceof SecurityError ||
    error instanceof PasswordResetError
  );
}

/**
 * Helper function to get appropriate HTTP status code from auth errors
 */
export function getAuthErrorStatusCode(error: any): number {
  if (isAuthError(error)) {
    return error.statusCode;
  }
  return 500; // Default to internal server error
}

/**
 * Helper function to get error code from auth errors
 */
export function getAuthErrorCode(error: any): string {
  if (isAuthError(error)) {
    return error.errorCode;
  }
  return "INTERNAL_ERROR";
}
