/**
 * Token Error Classes
 *
 * Custom error types for JWT token-related failures
 * Covers token validation, expiration, and manipulation
 */

import { ServiceError } from "../../user/errors/user.service.errors.js";

/**
 * Base Token Error
 * All token-related errors extend this for consistent error handling
 */
export abstract class TokenError extends ServiceError {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

/**
 * Token Expired Error
 * Used when JWT token has expired and needs refresh
 */
export class TokenExpiredError extends TokenError {
  readonly statusCode = 401;
  readonly errorCode = "TOKEN_EXPIRED";

  constructor(
    tokenType: "access" | "refresh" = "access",
    details?: Record<string, any>
  ) {
    super(
      `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} token has expired`,
      {
        tokenType,
        ...details,
      }
    );
  }
}

/**
 * Invalid Token Error
 * Used when JWT token is malformed, invalid, or tampered with
 */
export class InvalidTokenError extends TokenError {
  readonly statusCode = 401;
  readonly errorCode = "INVALID_TOKEN";

  constructor(
    reason: string = "Token is invalid",
    details?: Record<string, any>
  ) {
    super(`Invalid token: ${reason}`, {
      reason,
      ...details,
    });
  }
}

/**
 * Token Not Provided Error
 * Used when protected route is accessed without authorization header
 */
export class TokenNotProvidedError extends TokenError {
  readonly statusCode = 401;
  readonly errorCode = "TOKEN_NOT_PROVIDED";

  constructor(details?: Record<string, any>) {
    super("Authorization token is required", details);
  }
}

/**
 * Token Blacklisted Error
 * Used when token has been invalidated (logout, password change, etc.)
 */
export class TokenBlacklistedError extends TokenError {
  readonly statusCode = 401;
  readonly errorCode = "TOKEN_BLACKLISTED";

  constructor(
    reason: string = "Token has been invalidated",
    details?: Record<string, any>
  ) {
    super(`Token blacklisted: ${reason}`, {
      reason,
      ...details,
    });
  }
}

/**
 * Refresh Token Not Found Error
 * Used when refresh token doesn't exist in database/cache
 */
export class RefreshTokenNotFoundError extends TokenError {
  readonly statusCode = 401;
  readonly errorCode = "REFRESH_TOKEN_NOT_FOUND";

  constructor(details?: Record<string, any>) {
    super("Refresh token not found or has been revoked", details);
  }
}
