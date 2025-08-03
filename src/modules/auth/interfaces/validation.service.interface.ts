/**
 * Validation Service Interface
 *
 * Handles input validation for auth operations.
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface IValidationService {
  /**
   * Validate registration data
   */
  validateRegistration(data: any): Promise<ValidationResult>;

  /**
   * Validate login data
   */
  validateLogin(data: any): Promise<ValidationResult>;

  /**
   * Validate password strength
   */
  validatePassword(password: string): Promise<ValidationResult>;

  /**
   * Validate email format
   */
  validateEmail(email: string): ValidationResult;

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): ValidationResult;
}
