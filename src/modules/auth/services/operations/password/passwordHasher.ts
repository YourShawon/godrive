/**
 * Password Hasher
 *
 * Handles password hashing and verification using bcrypt
 * Focused solely on cryptographic operations
 */

import bcrypt from "bcrypt";
import { logger } from "../../../../../utils/logger/index.js";
import { PasswordHashError } from "../../../errors/index.js";

/**
 * Password Hasher Class
 * Handles bcrypt operations for password security
 */
export class PasswordHasher {
  private readonly saltRounds: number;

  constructor() {
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12");

    logger.debug("🔐 PasswordHasher initialized", {
      saltRounds: this.saltRounds,
      module: "PasswordHasher",
      action: "constructor",
    });
  }

  /**
   * Hash a plain text password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    const requestId = `hashPassword_${Date.now()}`;
    const startTime = Date.now();

    logger.debug("🔒 [PasswordHasher] Hashing password", {
      passwordLength: password.length,
      saltRounds: this.saltRounds,
      requestId,
      module: "PasswordHasher",
      action: "hashPassword_start",
    });

    try {
      // Basic input validation
      if (!password || typeof password !== "string") {
        throw new PasswordHashError(
          "Password must be a non-empty string",
          "Invalid password input"
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      const duration = Date.now() - startTime;

      logger.info("✅ [PasswordHasher] Password hashed successfully", {
        passwordLength: password.length,
        hashedLength: hashedPassword.length,
        saltRounds: this.saltRounds,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordHasher",
        action: "hashPassword_success",
      });

      return hashedPassword;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof PasswordHashError) {
        throw error;
      }

      logger.error("❌ [PasswordHasher] Password hashing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        passwordLength: password.length,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordHasher",
        action: "hashPassword_error",
      });

      throw new PasswordHashError(
        "Failed to hash password",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Verify a plain text password against a hash
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    const requestId = `verifyPassword_${Date.now()}`;
    const startTime = Date.now();

    logger.debug("🔍 [PasswordHasher] Verifying password", {
      plainPasswordLength: plainPassword.length,
      hashedPasswordLength: hashedPassword.length,
      requestId,
      module: "PasswordHasher",
      action: "verifyPassword_start",
    });

    try {
      // Basic input validation
      if (!plainPassword || !hashedPassword) {
        throw new PasswordHashError(
          "Both plain password and hashed password are required",
          "Missing password data"
        );
      }

      if (
        typeof plainPassword !== "string" ||
        typeof hashedPassword !== "string"
      ) {
        throw new PasswordHashError(
          "Passwords must be strings",
          "Invalid password types"
        );
      }

      // Verify the password
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

      const duration = Date.now() - startTime;

      if (isMatch) {
        logger.info("✅ [PasswordHasher] Password verification successful", {
          plainPasswordLength: plainPassword.length,
          hashedPasswordLength: hashedPassword.length,
          duration: `${duration}ms`,
          requestId,
          module: "PasswordHasher",
          action: "verifyPassword_success",
        });
      } else {
        logger.warn("⚠️ [PasswordHasher] Password verification failed", {
          plainPasswordLength: plainPassword.length,
          hashedPasswordLength: hashedPassword.length,
          duration: `${duration}ms`,
          requestId,
          module: "PasswordHasher",
          action: "verifyPassword_failed",
        });
      }

      return isMatch;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof PasswordHashError) {
        throw error;
      }

      logger.error("❌ [PasswordHasher] Password verification error", {
        error: error instanceof Error ? error.message : "Unknown error",
        plainPasswordLength: plainPassword.length,
        hashedPasswordLength: hashedPassword.length,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordHasher",
        action: "verifyPassword_error",
      });

      throw new PasswordHashError(
        "Failed to verify password",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Check if password needs rehashing (e.g., salt rounds changed)
   */
  needsRehashing(hashedPassword: string): boolean {
    try {
      const rounds = bcrypt.getRounds(hashedPassword);
      const needsRehash = rounds !== this.saltRounds;

      logger.debug("🔄 [PasswordHasher] Rehashing check", {
        currentRounds: rounds,
        requiredRounds: this.saltRounds,
        needsRehash,
        module: "PasswordHasher",
        action: "needsRehashing",
      });

      return needsRehash;
    } catch (error) {
      logger.warn("⚠️ [PasswordHasher] Unable to check hash rounds", {
        error: error instanceof Error ? error.message : "Unknown error",
        module: "PasswordHasher",
        action: "needsRehashing_error",
      });
      return false;
    }
  }

  /**
   * Get current salt rounds configuration
   */
  getSaltRounds(): number {
    return this.saltRounds;
  }
}
