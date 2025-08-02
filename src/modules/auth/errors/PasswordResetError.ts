/**
 * Password Reset Error Classes
 *
 * Custom error types for password reset flow failures
 * Covers reset token validation, expiration, and security
 */

import { ServiceError } from "../../user/errors/user.service.errors.js";

/**
 * Base Password Reset Error
 * All password reset errors extend this for consistent error handling
 */
export abstract class PasswordResetError extends ServiceError {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

/**
 * Invalid Reset Token Error
 * Used when password reset token is invalid, malformed, or tampered with
 */
export class InvalidResetTokenError extends PasswordResetError {
  readonly statusCode = 400; // HTTP 400 Bad Request
  readonly errorCode = "INVALID_RESET_TOKEN";

  constructor(
    reason: string = "Reset token is invalid",
    details?: Record<string, any>
  ) {
    super(`Invalid reset token: ${reason}`, {
      reason,
      ...details,
    });
  }
}

/**
 * Reset Token Expired Error
 * Used when password reset token has expired (typically 1 hour)
 */
export class ResetTokenExpiredError extends PasswordResetError {
  readonly statusCode = 400; // HTTP 400 Bad Request
  readonly errorCode = "RESET_TOKEN_EXPIRED";

  constructor(details?: Record<string, any>) {
    super("Password reset token has expired. Please request a new one.", {
      action: "Request a new password reset",
      ...details,
    });
  }
}

/**
 * Reset Token Already Used Error
 * Used when password reset token has already been used
 */
export class ResetTokenUsedError extends PasswordResetError {
  readonly statusCode = 400; // HTTP 400 Bad Request
  readonly errorCode = "RESET_TOKEN_USED";

  constructor(details?: Record<string, any>) {
    super(
      "Password reset token has already been used. Please request a new one.",
      {
        action: "Request a new password reset if needed",
        ...details,
      }
    );
  }
}

/**
 * Too Many Reset Requests Error
 * Used when user requests too many password resets in short time
 */
export class TooManyResetRequestsError extends PasswordResetError {
  readonly statusCode = 429; // HTTP 429 Too Many Requests
  readonly errorCode = "TOO_MANY_RESET_REQUESTS";

  constructor(
    email: string,
    cooldownMinutes: number = 15,
    details?: Record<string, any>
  ) {
    super(
      `Too many password reset requests for ${email}. Please wait ${cooldownMinutes} minutes before requesting again.`,
      {
        email,
        cooldownMinutes,
        retryAfter: new Date(
          Date.now() + cooldownMinutes * 60 * 1000
        ).toISOString(),
        ...details,
      }
    );
  }
}

/**
 * Password Reset Email Failed Error
 * Used when email service fails to send password reset email
 */
export class PasswordResetEmailFailedError extends PasswordResetError {
  readonly statusCode = 500; // HTTP 500 Internal Server Error
  readonly errorCode = "PASSWORD_RESET_EMAIL_FAILED";

  constructor(email: string, details?: Record<string, any>) {
    super(`Failed to send password reset email to ${email}`, {
      email,
      action: "Please try again later or contact support",
      ...details,
    });
  }
}
