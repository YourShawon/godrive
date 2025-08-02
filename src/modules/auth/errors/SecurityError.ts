/**
 * Account Security Error Classes
 *
 * Custom error types for account security and access control failures
 * Covers account lockouts, rate limiting, and permission issues
 */

import { ServiceError } from "../../user/errors/user.service.errors.js";

/**
 * Base Security Error
 * All security-related errors extend this for consistent error handling
 */
export abstract class SecurityError extends ServiceError {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

/**
 * Account Locked Error
 * Used when account is temporarily locked due to too many failed attempts
 */
export class AccountLockedError extends SecurityError {
  readonly statusCode = 423; // HTTP 423 Locked
  readonly errorCode = "ACCOUNT_LOCKED";

  constructor(
    email: string,
    lockDurationMinutes: number = 30,
    details?: Record<string, any>
  ) {
    super(
      `Account ${email} is temporarily locked. Try again in ${lockDurationMinutes} minutes.`,
      {
        email,
        lockDurationMinutes,
        lockedUntil: new Date(
          Date.now() + lockDurationMinutes * 60 * 1000
        ).toISOString(),
        ...details,
      }
    );
  }
}

/**
 * Rate Limit Exceeded Error
 * Used when user exceeds allowed request rate (login attempts, etc.)
 */
export class RateLimitExceededError extends SecurityError {
  readonly statusCode = 429; // HTTP 429 Too Many Requests
  readonly errorCode = "RATE_LIMIT_EXCEEDED";

  constructor(
    action: string,
    retryAfterSeconds: number = 60,
    details?: Record<string, any>
  ) {
    super(
      `Too many ${action} attempts. Please try again in ${retryAfterSeconds} seconds.`,
      {
        action,
        retryAfterSeconds,
        retryAfter: new Date(
          Date.now() + retryAfterSeconds * 1000
        ).toISOString(),
        ...details,
      }
    );
  }
}

/**
 * Insufficient Permissions Error
 * Used when user doesn't have required permissions for an action
 */
export class InsufficientPermissionsError extends SecurityError {
  readonly statusCode = 403; // HTTP 403 Forbidden
  readonly errorCode = "INSUFFICIENT_PERMISSIONS";

  constructor(
    requiredPermission: string,
    userRole?: string,
    details?: Record<string, any>
  ) {
    super(`Insufficient permissions. Required: ${requiredPermission}`, {
      requiredPermission,
      userRole,
      ...details,
    });
  }
}

/**
 * Email Not Verified Error
 * Used when user tries to access features requiring email verification
 */
export class EmailNotVerifiedError extends SecurityError {
  readonly statusCode = 403; // HTTP 403 Forbidden
  readonly errorCode = "EMAIL_NOT_VERIFIED";

  constructor(email: string, details?: Record<string, any>) {
    super(`Email ${email} must be verified before accessing this feature`, {
      email,
      action: "Please check your email for verification link",
      ...details,
    });
  }
}

/**
 * Session Expired Error
 * Used when user session has expired due to inactivity
 */
export class SessionExpiredError extends SecurityError {
  readonly statusCode = 401; // HTTP 401 Unauthorized
  readonly errorCode = "SESSION_EXPIRED";

  constructor(details?: Record<string, any>) {
    super("Your session has expired. Please login again.", {
      action: "Please login again to continue",
      ...details,
    });
  }
}
