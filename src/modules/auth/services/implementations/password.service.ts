/**
 * Password Service Implementation
 *
 * Handles password hashing, verification using bcrypt.
 */

import bcrypt from "bcrypt";
import { IPasswordService } from "../../interfaces/password.service.interface.js";
import { logger } from "@utils/logger/config.js";

export class PasswordService implements IPasswordService {
  private readonly saltRounds = 12;

  constructor() {
    logger.debug("📦 PasswordService instantiated");
  }

  /**
   * Hash a plain text password
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.saltRounds);
      return hash;
    } catch (error) {
      logger.error("❌ Password hashing failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error("Failed to hash password");
    }
  }

  /**
   * Verify a plain text password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcrypt.compare(password, hash);
      return isValid;
    } catch (error) {
      logger.error("❌ Password verification failed", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    return password;
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number;
    strength: "weak" | "fair" | "good" | "strong";
    suggestions: string[];
  } {
    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) score += 25;
    else suggestions.push("Use at least 8 characters");

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;
    else suggestions.push("Add uppercase letters");

    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;
    else suggestions.push("Add lowercase letters");

    // Number check
    if (/\d/.test(password)) score += 15;
    else suggestions.push("Add numbers");

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    else suggestions.push("Add special characters");

    let strength: "weak" | "fair" | "good" | "strong";
    if (score < 40) strength = "weak";
    else if (score < 70) strength = "fair";
    else if (score < 90) strength = "good";
    else strength = "strong";

    return { score, strength, suggestions };
  }
}
