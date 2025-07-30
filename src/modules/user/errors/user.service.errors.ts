/**
 * User Service Error Classes
 *
 * FAANG Standard: Custom error types for precise error handling and monitoring
 * Each error type has specific HTTP status codes and error codes for API consistency
 */

/**
 * Base Service Error
 * All service errors extend this for consistent error handling
 */
export abstract class ServiceError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;

    // Maintain proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * User Not Found Error
 * Thrown when a user doesn't exist or is inactive
 */
export class UserNotFoundError extends ServiceError {
  readonly statusCode = 404;
  readonly errorCode = "USER_NOT_FOUND";

  constructor(userId: string, details?: Record<string, any>) {
    super(`User with ID ${userId} not found`, { userId, ...details });
  }
}

/**
 * User Service Internal Error
 * Thrown when internal service operations fail
 */
export class UserServiceError extends ServiceError {
  readonly statusCode = 500;
  readonly errorCode = "USER_SERVICE_ERROR";

  constructor(message: string, details?: Record<string, any>) {
    super(`User service error: ${message}`, details);
  }
}

/**
 * User Access Denied Error
 * Thrown when user exists but access is denied (future: permissions)
 */
export class UserAccessDeniedError extends ServiceError {
  readonly statusCode = 403;
  readonly errorCode = "USER_ACCESS_DENIED";

  constructor(userId: string, reason: string, details?: Record<string, any>) {
    super(`Access denied for user ${userId}: ${reason}`, {
      userId,
      reason,
      ...details,
    });
  }
}
