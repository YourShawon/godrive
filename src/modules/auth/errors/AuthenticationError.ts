/**
 * Authentication Error Classes
 *
 * Custom error types for authentication failures following ServiceError pattern
 * Each error type has specific HTTP status codes and error codes for API consistency
 */

// Import the base ServiceError from user module (established pattern)
import { ServiceError } from "../../user/errors/user.service.errors.js";

/**
 * Base Authentication Error
 * All auth-related errors extend this for consistent error handling
 */
export abstract class AuthenticationError extends ServiceError {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, details?: Record<string, any>) {
    super(message, details);
  }
}

/**
 * Invalid Credentials Error - Specific authentication failure
 * Used when email/password combination is incorrect
 */
export class InvalidCredentialsError extends AuthenticationError {
  readonly statusCode = 401;
  readonly errorCode = "INVALID_CREDENTIALS";

  constructor(details?: Record<string, any>) {
    super("Invalid email or password", details);
  }
}

/**
 * Account Not Found Error - User doesn't exist
 * Used when attempting to authenticate non-existent user
 */
export class AccountNotFoundError extends AuthenticationError {
  readonly statusCode = 404;
  readonly errorCode = "ACCOUNT_NOT_FOUND";

  constructor(email: string, details?: Record<string, any>) {
    super(`Account with email ${email} not found`, {
      email,
      ...details,
    });
  }
}

/**
 * Account Disabled Error - User account is disabled
 * Used when user account exists but is deactivated
 */
export class AccountDisabledError extends AuthenticationError {
  readonly statusCode = 403;
  readonly errorCode = "ACCOUNT_DISABLED";

  constructor(email: string, details?: Record<string, any>) {
    super(`Account ${email} is disabled`, {
      email,
      reason: "Account has been deactivated",
      ...details,
    });
  }
}
