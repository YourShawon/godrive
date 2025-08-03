/**
 * Custom Validation Error Class
 *
 * Thrown when validation fails.
 */

export class ValidationError extends Error {
  public readonly validationErrors: string[];

  constructor(message: string, validationErrors: string[] = []) {
    super(message);
    this.name = "ValidationError";
    this.validationErrors = validationErrors;

    // Maintain proper stack trace (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}
