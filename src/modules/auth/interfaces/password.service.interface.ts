/**
 * Password Service Interface
 *
 * Handles password hashing, verification, and validation.
 */

export interface IPasswordService {
  /**
   * Hash a plain text password
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verify a plain text password against a hash
   */
  verifyPassword(password: string, hash: string): Promise<boolean>;

  /**
   * Generate a secure random password
   */
  generateSecurePassword(length?: number): string;

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): {
    score: number; // 0-100
    strength: "weak" | "fair" | "good" | "strong";
    suggestions: string[];
  };
}
