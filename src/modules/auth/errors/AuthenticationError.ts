/**
 * Authentication Error Classes
 *
 * Custom error types for authentication failures
 */

/**
 * Base Authentication Error
 * Concrete class for authentication failures
 */
export class AuthenticationError extends Error {
  public readonly statusCode: number = 401;
  public readonly errorCode: string = "AUTHENTICATION_ERROR";

  constructor(
    message: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = "AuthenticationError";

    // Maintain proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
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
