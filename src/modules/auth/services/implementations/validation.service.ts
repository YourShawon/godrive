/**
 * Validation Service Implementation
 *
 * Handles input validation for auth operations.
 */

import {
  IValidationService,
  ValidationResult,
} from "../../interfaces/validation.service.interface.js";
import { logger } from "@utils/logger/config.js";

export class ValidationService implements IValidationService {
  constructor() {
    logger.debug("📦 ValidationService instantiated");
  }

  /**
   * Validate registration data
   */
  async validateRegistration(data: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Email validation
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    }

    // Password validation
    const passwordResult = await this.validatePassword(data.password);
    if (!passwordResult.isValid) {
      errors.push(...passwordResult.errors);
    }

    // First name validation
    if (!data.firstName || data.firstName.trim().length < 1) {
      errors.push("First name is required");
    }

    // Last name validation
    if (!data.lastName || data.lastName.trim().length < 1) {
      errors.push("Last name is required");
    }

    // Phone number validation (optional)
    if (data.phoneNumber) {
      const phoneResult = this.validatePhoneNumber(data.phoneNumber);
      if (!phoneResult.isValid) {
        errors.push(...phoneResult.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate login data
   */
  async validateLogin(data: any): Promise<ValidationResult> {
    const errors: string[] = [];

    // Email validation
    const emailResult = this.validateEmail(data.email);
    if (!emailResult.isValid) {
      errors.push(...emailResult.errors);
    }

    // Password required
    if (!data.password || data.password.length === 0) {
      errors.push("Password is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate password strength
   */
  async validatePassword(password: string): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!password) {
      errors.push("Password is required");
      return { isValid: false, errors };
    }

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): ValidationResult {
    const errors: string[] = [];

    if (!email) {
      errors.push("Email is required");
      return { isValid: false, errors };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Invalid email format");
    }

    if (email.length > 254) {
      errors.push("Email is too long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): ValidationResult {
    const errors: string[] = [];

    if (!phoneNumber) {
      return { isValid: true, errors }; // Phone number is optional
    }

    // Remove all non-digit characters for validation
    const digitsOnly = phoneNumber.replace(/\D/g, "");

    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      errors.push("Phone number must be between 10 and 15 digits");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
