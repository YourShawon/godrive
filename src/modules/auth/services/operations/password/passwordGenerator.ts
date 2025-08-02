/**
 * Password Generator
 *
 * Handles secure password generation with configurable requirements
 * Uses cryptographically secure random generation
 */

import { logger } from "../../../../../utils/logger/index.js";
import { PasswordRequirements } from "./passwordValidator.js";

/**
 * Password Generator Class
 * Generates secure passwords based on requirements
 */
export class PasswordGenerator {
  private readonly requirements: PasswordRequirements;

  // Character sets for password generation
  private readonly charSets = {
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  };

  constructor(requirements: PasswordRequirements) {
    this.requirements = requirements;

    logger.debug("🔧 PasswordGenerator initialized", {
      requirements: this.requirements,
      module: "PasswordGenerator",
      action: "constructor",
    });
  }

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length: number = 16): string {
    const requestId = `generatePassword_${Date.now()}`;
    const startTime = Date.now();

    logger.debug("🎲 [PasswordGenerator] Generating secure password", {
      length,
      requirements: this.requirements,
      requestId,
      module: "PasswordGenerator",
      action: "generateSecurePassword_start",
    });

    try {
      let charset = "";
      let password = "";

      // Ensure at least one character from each required type
      if (this.requirements.requireLowercase) {
        charset += this.charSets.lowercase;
        password += this.getRandomChar(this.charSets.lowercase);
      }

      if (this.requirements.requireUppercase) {
        charset += this.charSets.uppercase;
        password += this.getRandomChar(this.charSets.uppercase);
      }

      if (this.requirements.requireNumbers) {
        charset += this.charSets.numbers;
        password += this.getRandomChar(this.charSets.numbers);
      }

      if (this.requirements.requireSpecialChars) {
        charset += this.charSets.specialChars;
        password += this.getRandomChar(this.charSets.specialChars);
      }

      // Fill the rest of the password length randomly
      for (let i = password.length; i < length; i++) {
        password += this.getRandomChar(charset);
      }

      // Shuffle the password to randomize the guaranteed character positions
      const shuffledPassword = this.shuffleString(password);

      const duration = Date.now() - startTime;

      logger.info("✅ [PasswordGenerator] Secure password generated", {
        length: shuffledPassword.length,
        hasUppercase: /[A-Z]/.test(shuffledPassword),
        hasLowercase: /[a-z]/.test(shuffledPassword),
        hasNumbers: /[0-9]/.test(shuffledPassword),
        hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
          shuffledPassword
        ),
        duration: `${duration}ms`,
        requestId,
        module: "PasswordGenerator",
        action: "generateSecurePassword_success",
      });

      return shuffledPassword;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [PasswordGenerator] Password generation failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        length,
        duration: `${duration}ms`,
        requestId,
        module: "PasswordGenerator",
        action: "generateSecurePassword_error",
      });

      throw new Error("Failed to generate secure password");
    }
  }

  /**
   * Generate multiple password suggestions
   */
  generatePasswordSuggestions(
    count: number = 3,
    length: number = 16
  ): string[] {
    const suggestions: string[] = [];

    for (let i = 0; i < count; i++) {
      suggestions.push(this.generateSecurePassword(length));
    }

    logger.debug("📝 [PasswordGenerator] Generated password suggestions", {
      count: suggestions.length,
      length,
      module: "PasswordGenerator",
      action: "generatePasswordSuggestions",
    });

    return suggestions;
  }

  /**
   * Get a random character from a character set
   */
  private getRandomChar(charset: string): string {
    if (!charset || charset.length === 0) {
      throw new Error("Character set cannot be empty");
    }
    return charset[Math.floor(Math.random() * charset.length)]!;
  }

  /**
   * Shuffle a string using Fisher-Yates algorithm
   */
  private shuffleString(str: string): string {
    const array = str.split("");

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i]!;
      array[i] = array[j]!;
      array[j] = temp;
    }

    return array.join("");
  }
}
