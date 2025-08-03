/**
 * Password Authentication Service
 *
 * Handles password-related operations like password changes.
 * Focused on password security and management.
 */

import { logger } from "@utils/logger/config.js";
import { ChangePasswordRequest } from "../../interfaces/auth.service.interface.js";
import { IAuthRepository } from "../../repositories/interfaces/auth.repository.interface.js";
import { IRefreshTokenRepository } from "../../repositories/interfaces/refreshToken.repository.interface.js";
import { IPasswordService } from "../../interfaces/password.service.interface.js";
import { IValidationService } from "../../interfaces/validation.service.interface.js";
import { AuthenticationError } from "../../errors/AuthenticationError.js";
import { ValidationError } from "../../errors/ValidationError.js";
import { AuthServiceUtils } from "./auth-service.utils.js";

export class PasswordAuthService {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly passwordService: IPasswordService,
    private readonly validationService: IValidationService
  ) {
    logger.debug("🔐 PasswordAuthService initialized");
  }

  // ==================== PASSWORD CHANGE ====================

  async changePassword(
    changePasswordData: ChangePasswordRequest
  ): Promise<{ success: boolean; message: string }> {
    const requestId = AuthServiceUtils.generateRequestId(
      "changePassword",
      changePasswordData.userId
    );

    AuthServiceUtils.logOperationStart(
      "PasswordAuthService",
      "Password change",
      {
        userId: changePasswordData.userId,
      },
      requestId
    );

    return AuthServiceUtils.executeWithErrorHandling(
      "PasswordAuthService",
      "Password change",
      async () => {
        // Get and verify user
        const user = await this.verifyUserExists(changePasswordData.userId);

        // Verify current password
        await this.verifyCurrentPassword(
          changePasswordData.currentPassword,
          user.password
        );

        // Validate new password
        await this.validateNewPassword(changePasswordData.newPassword);

        // Update password
        await this.updateUserPassword(
          changePasswordData.userId,
          changePasswordData.newPassword
        );

        // Security: Revoke all refresh tokens
        await this.revokeAllUserTokensForSecurity(changePasswordData.userId);

        AuthServiceUtils.logSuccess(
          "PasswordAuthService",
          "Password change",
          {
            userId: changePasswordData.userId,
          },
          requestId
        );

        return {
          success: true,
          message: "Password changed successfully. Please log in again.",
        };
      },
      requestId,
      { userId: changePasswordData.userId }
    );
  } // ==================== PASSWORD VALIDATION ====================

  async validatePasswordStrength(password: string): Promise<{
    isValid: boolean;
    errors: string[];
    score: number;
  }> {
    const validationResult =
      await this.validationService.validatePassword(password);

    // Calculate password strength score (0-100)
    let score = 0;
    if (password.length >= 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;

    return {
      isValid: validationResult.isValid,
      errors: validationResult.errors,
      score: Math.min(score, 100),
    };
  }

  // ==================== PASSWORD RESET (Future Implementation) ====================

  async initiatePasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string }> {
    // TODO: Implement password reset flow
    // 1. Generate reset token
    // 2. Store reset token with expiration
    // 3. Send reset email
    // 4. Return success response

    logger.info("🔄 [PasswordAuthService] Password reset initiated", { email });

    throw new Error("Password reset functionality not yet implemented");
  }

  async confirmPasswordReset(
    resetToken: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // TODO: Implement password reset confirmation
    // 1. Verify reset token
    // 2. Validate new password
    // 3. Update user password
    // 4. Invalidate reset token
    // 5. Revoke all refresh tokens

    logger.info("✅ [PasswordAuthService] Password reset confirmed");

    throw new Error("Password reset functionality not yet implemented");
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async verifyUserExists(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }
    return user;
  }

  private async verifyCurrentPassword(
    currentPassword: string,
    hashedPassword: string
  ): Promise<void> {
    const isCurrentPasswordValid = await this.passwordService.verifyPassword(
      currentPassword,
      hashedPassword
    );

    if (!isCurrentPasswordValid) {
      throw new AuthenticationError("Current password is incorrect");
    }
  }

  private async validateNewPassword(newPassword: string): Promise<void> {
    const validationResult =
      await this.validationService.validatePassword(newPassword);
    if (!validationResult.isValid) {
      throw new ValidationError(
        "Invalid new password",
        validationResult.errors
      );
    }
  }

  private async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<void> {
    const hashedNewPassword =
      await this.passwordService.hashPassword(newPassword);

    const updateSuccess = await this.authRepository.updateUserPassword(
      userId,
      hashedNewPassword
    );

    if (!updateSuccess) {
      throw new Error("Failed to update password");
    }
  }

  private async revokeAllUserTokensForSecurity(userId: string): Promise<void> {
    await this.refreshTokenRepository.revokeAllUserTokens(
      userId,
      "Password changed"
    );
    logger.info("🔒 [PasswordAuthService] All tokens revoked for security", {
      userId,
    });
  }
}
