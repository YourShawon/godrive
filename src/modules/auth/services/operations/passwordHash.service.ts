/**
 * Password Hash Service
 *
 * Orchestrates password operations using modular components
 * Provides a unified interface for password hashing, validation, and generation
 */

import { logger } from "../../../../utils/logger/index.js";
import { PasswordValidationError } from "../../errors/index.js";
import {
  PasswordValidator,
  PasswordGenerator,
  PasswordHasher,
  PasswordRequirements,
  PasswordValidationResult,
  PasswordStrength,
} from "./password/index.js";

/**
 * Password Hash Service
 * Main service that orchestrates all password operations
 */
export class PasswordHashService {
  private readonly validator: PasswordValidator;
  private readonly generator: PasswordGenerator;
  private readonly hasher: PasswordHasher;

  constructor() {
    this.validator = new PasswordValidator();
    this.hasher = new PasswordHasher();
    this.generator = new PasswordGenerator(this.validator.getRequirements());

    logger.info("🔒 PasswordHashService initialized", {
      modules: {
        validator: "PasswordValidator",
        generator: "PasswordGenerator",
        hasher: "PasswordHasher",
      },
      saltRounds: this.hasher.getSaltRounds(),
      passwordRequirements: this.validator.getRequirements(),
      module: "PasswordHashService",
      action: "constructor",
    });
  }

  /**
   * Hash a plain text password (with validation)
   */
  async hashPassword(password: string): Promise<string> {
    const requestId = `hashPassword_${Date.now()}`;
    const startTime = Date.now();

    logger.debug("🔒 [PasswordHashService] Hashing password", {
      passwordLength: password.length,
      requestId,
      module: "PasswordHashService",
      action: "hashPassword_start",
    });

    try {
      // Validate password before hashing
      const validation = this.validator.validatePassword(password);
      if (!validation.isValid) {
        throw new PasswordValidationError(
          `Password does not meet requirements: ${validation.errors.join(", ")}`,
          validation.errors,
          validation.requirements
        );
      }

      // Hash the password
      const hashedPassword = await this.hasher.hashPassword(password);

      const duration = Date.now() - startTime;

      logger.info("✅ [PasswordHashService] Password hashed successfully", {
        passwordLength: password.length,
        passwordStrength: validation.strength,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordHashService",
        action: "hashPassword_success",
      });

      return hashedPassword;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof PasswordValidationError) {
        logger.warn("⚠️ [PasswordHashService] Password validation failed", {
          passwordLength: password.length,
          validationErrors: error.validationErrors,
          duration: `${duration}ms`,
          requestId,
          module: "PasswordHashService",
          action: "hashPassword_validation_failed",
        });
        throw error;
      }

      logger.error("❌ [PasswordHashService] Password hashing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        passwordLength: password.length,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordHashService",
        action: "hashPassword_error",
      });

      throw error;
    }
  }

  /**
   * Verify a plain text password against a hash
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    return this.hasher.verifyPassword(plainPassword, hashedPassword);
  }

  /**
   * Validate password against requirements
   */
  validatePassword(password: string): PasswordValidationResult {
    return this.validator.validatePassword(password);
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    return this.generator.generateSecurePassword(length);
  }

  /**
   * Generate multiple password suggestions
   */
  generatePasswordSuggestions(
    count: number = 3,
    length: number = 16
  ): string[] {
    return this.generator.generatePasswordSuggestions(count, length);
  }

  /**
   * Check if password needs rehashing
   */
  needsRehashing(hashedPassword: string): boolean {
    return this.hasher.needsRehashing(hashedPassword);
  }

  /**
   * Get password requirements configuration
   */
  getPasswordRequirements(): PasswordRequirements {
    return this.validator.getRequirements();
  }

  /**
   * Get salt rounds configuration
   */
  getSaltRounds(): number {
    return this.hasher.getSaltRounds();
  }
}

// Re-export types for external use
export type { PasswordRequirements, PasswordValidationResult };

export { PasswordStrength };
