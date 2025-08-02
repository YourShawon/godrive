/**
 * Password Validator
 *
 * Handles password validation, strength calculation, and requirement checking
 * Separated from hashing logic for better maintainability
 */

import { logger } from "../../../../../utils/logger/index.js";

/**
 * Password complexity requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = "weak",
  MEDIUM = "medium",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  strength: PasswordStrength;
  errors: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
  };
}

/**
 * Password Validator Class
 * Handles all password validation and strength calculation logic
 */
export class PasswordValidator {
  private readonly requirements: PasswordRequirements;

  constructor() {
    this.requirements = {
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || "8"),
      requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== "false",
      requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== "false",
      requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== "false",
      requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL !== "false",
    };

    logger.debug("🔍 PasswordValidator initialized", {
      requirements: this.requirements,
      module: "PasswordValidator",
      action: "constructor",
    });
  }

  /**
   * Validate password against requirements
   */
  validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    const requirements = {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      specialChars: false,
    };

    // Check length
    if (password.length >= this.requirements.minLength) {
      requirements.length = true;
    } else {
      errors.push(
        `Password must be at least ${this.requirements.minLength} characters long`
      );
    }

    // Check uppercase
    if (this.requirements.requireUppercase) {
      if (/[A-Z]/.test(password)) {
        requirements.uppercase = true;
      } else {
        errors.push("Password must contain at least one uppercase letter");
      }
    } else {
      requirements.uppercase = true;
    }

    // Check lowercase
    if (this.requirements.requireLowercase) {
      if (/[a-z]/.test(password)) {
        requirements.lowercase = true;
      } else {
        errors.push("Password must contain at least one lowercase letter");
      }
    } else {
      requirements.lowercase = true;
    }

    // Check numbers
    if (this.requirements.requireNumbers) {
      if (/[0-9]/.test(password)) {
        requirements.numbers = true;
      } else {
        errors.push("Password must contain at least one number");
      }
    } else {
      requirements.numbers = true;
    }

    // Check special characters
    if (this.requirements.requireSpecialChars) {
      if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        requirements.specialChars = true;
      } else {
        errors.push("Password must contain at least one special character");
      }
    } else {
      requirements.specialChars = true;
    }

    // Determine password strength
    const strength = this.calculatePasswordStrength(password, requirements);

    return {
      isValid: errors.length === 0,
      strength,
      errors,
      requirements,
    };
  }

  /**
   * Calculate password strength based on various factors
   */
  private calculatePasswordStrength(
    password: string,
    requirements: PasswordValidationResult["requirements"]
  ): PasswordStrength {
    let score = 0;

    // Base score for length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Score for character types
    if (requirements.uppercase) score += 1;
    if (requirements.lowercase) score += 1;
    if (requirements.numbers) score += 1;
    if (requirements.specialChars) score += 1;

    // Additional strength indicators
    if (password.length >= 20) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/.test(password)) score += 1;

    // Determine strength based on score
    if (score >= 8) return PasswordStrength.VERY_STRONG;
    if (score >= 6) return PasswordStrength.STRONG;
    if (score >= 4) return PasswordStrength.MEDIUM;
    return PasswordStrength.WEAK;
  }

  /**
   * Get password requirements configuration
   */
  getRequirements(): PasswordRequirements {
    return { ...this.requirements };
  }
}
