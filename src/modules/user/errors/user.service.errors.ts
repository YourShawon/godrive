/**
 * User Service Error Classes
 *
 * Custom error types for precise error handling and monitoring
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

/**
 * User Already Exists Error
 * Thrown when attempting to create a user with an email that already exists
 */
export class UserAlreadyExistsError extends ServiceError {
  readonly statusCode = 409; // Conflict
  readonly errorCode = "USER_ALREADY_EXISTS";

  constructor(email: string, details?: Record<string, any>) {
    super(`User with email ${email} already exists`, { email, ...details });
  }
}

/**
 * Invalid User Data Error
 * Thrown when user data violates business rules (beyond validation)
 */
export class InvalidUserDataError extends ServiceError {
  readonly statusCode = 422; // Unprocessable Entity
  readonly errorCode = "INVALID_USER_DATA";

  constructor(reason: string, field?: string, details?: Record<string, any>) {
    super(`Invalid user data: ${reason}`, {
      field,
      reason,
      ...details,
    });
  }
}

/**
 * User Validation Error
 * Thrown when input validation fails (schema validation)
 */
export class UserValidationError extends ServiceError {
  readonly statusCode = 400; // Bad Request
  readonly errorCode = "USER_VALIDATION_ERROR";

  constructor(
    validationErrors: Array<{ field: string; message: string; code: string }>,
    details?: Record<string, any>
  ) {
    const errorSummary = validationErrors
      .map((err) => `${err.field}: ${err.message}`)
      .join(", ");

    super(`Validation failed: ${errorSummary}`, {
      validationErrors,
      ...details,
    });
  }
}

/**
 * User Operation Failed Error
 * Thrown when a user operation fails due to external dependencies
 */
export class UserOperationFailedError extends ServiceError {
  readonly statusCode = 503; // Service Unavailable
  readonly errorCode = "USER_OPERATION_FAILED";

  constructor(
    operation: string,
    reason: string,
    details?: Record<string, any>
  ) {
    super(`User operation '${operation}' failed: ${reason}`, {
      operation,
      reason,
      ...details,
    });
  }
}
