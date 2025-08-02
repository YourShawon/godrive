/**
 * User Update Service - Extracted from main UserService
 * Handles all user update business logic
 *
 * Single Responsibility: User updates and password changes only
 * Reuses patterns from UserCreationService
 */

import bcrypt from "bcryptjs";
import { logger } from "../../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
  UpdateUserData,
} from "../../interfaces/user.repository.interface.js";
import {
  UpdateUserInput,
  ChangePasswordInput,
} from "../../schemas/updateUser.schema.js";
import { userCacheService } from "../cache/userCache.service.js";
import {
  UserNotFoundError,
  UserUpdateForbiddenError,
  UserAlreadyExistsError,
  InvalidPasswordError,
  UserOperationFailedError,
} from "../../errors/index.js";

export class UserUpdateService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Update user with business logic and authorization
   */
  async updateUser(
    id: string,
    userData: UpdateUserInput,
    requesterId: string
  ): Promise<SafeUser> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info("🔧 [UserUpdateService] Starting updateUser", {
      userId: id,
      requesterId,
      updateFields: Object.keys(userData),
      requestId,
      module: "UserUpdateService",
      action: "updateUser_start",
    });

    try {
      // 1. Authorization check - users can only update themselves (for now)
      await this.validateUpdateAuthorization(id, requesterId, requestId);

      // 2. Check if user exists
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new UserNotFoundError(id, { requesterId, requestId });
      }

      // 3. Check email uniqueness if email is being updated
      if (userData.email && userData.email !== existingUser.email) {
        await this.validateEmailUniqueness(userData.email, id, requestId);
      }

      // 4. Prepare data for repository (no password in regular updates)
      const updateData: UpdateUserData = {
        ...userData,
      };

      // 5. Update user in database
      const updatedUser = await this.userRepository.update(id, updateData);

      if (!updatedUser) {
        throw new UserNotFoundError(id, { requesterId, requestId });
      }

      // 6. Update cache
      await this.updateUserCache(updatedUser, requestId);

      const duration = Date.now() - startTime;

      logger.info("✅ [UserUpdateService] User updated successfully", {
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        duration: `${duration}ms`,
        requestId,
        module: "UserUpdateService",
        action: "updateUser_success",
      });

      return updatedUser;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserUpdateService] Error in updateUser", {
        userId: id,
        requesterId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        module: "UserUpdateService",
        action: "updateUser_error",
      });

      // Re-throw known service errors as-is
      if (
        error instanceof UserNotFoundError ||
        error instanceof UserUpdateForbiddenError ||
        error instanceof UserAlreadyExistsError ||
        error instanceof UserOperationFailedError
      ) {
        throw error;
      }

      // Wrap unknown database/service errors
      throw new UserOperationFailedError(
        "update_user",
        error instanceof Error
          ? error.message
          : "Unknown error occurred during user update",
        {
          originalError: error instanceof Error ? error.message : error,
          userId: id,
          requesterId,
          requestId,
        }
      );
    }
  }

  /**
   * Change user password with current password verification
   */
  async changePassword(
    id: string,
    passwordData: ChangePasswordInput,
    requesterId: string
  ): Promise<boolean> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info("🔧 [UserUpdateService] Starting changePassword", {
      userId: id,
      requesterId,
      requestId,
      module: "UserUpdateService",
      action: "changePassword_start",
    });

    try {
      // 1. Authorization check
      await this.validateUpdateAuthorization(id, requesterId, requestId);

      // 2. Get user with password for verification
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundError(id, { requesterId, requestId });
      }

      // 3. Verify current password (we need to get the actual user with password)
      // Note: This requires a special repository method that includes password
      await this.verifyCurrentPassword(
        id,
        passwordData.currentPassword,
        requestId
      );

      // 4. Hash new password
      const hashedNewPassword = await this.hashPassword(
        passwordData.newPassword
      );

      // 5. Update password in database
      const success = await this.userRepository.updatePassword(
        id,
        hashedNewPassword
      );

      if (!success) {
        throw new UserOperationFailedError(
          "password_update",
          "Failed to update password in database",
          { userId: id, requesterId, requestId }
        );
      }

      // 6. Invalidate user cache (password change should refresh cache)
      await this.invalidateUserCache(id, requestId);

      const duration = Date.now() - startTime;

      logger.info("✅ [UserUpdateService] Password changed successfully", {
        userId: id,
        requesterId,
        duration: `${duration}ms`,
        requestId,
        module: "UserUpdateService",
        action: "changePassword_success",
      });

      return true;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserUpdateService] Error in changePassword", {
        userId: id,
        requesterId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        requestId,
        module: "UserUpdateService",
        action: "changePassword_error",
      });

      // Re-throw known service errors as-is
      if (
        error instanceof UserNotFoundError ||
        error instanceof UserUpdateForbiddenError ||
        error instanceof InvalidPasswordError ||
        error instanceof UserOperationFailedError
      ) {
        throw error;
      }

      // Wrap unknown errors
      throw new UserOperationFailedError(
        "change_password",
        error instanceof Error
          ? error.message
          : "Unknown error occurred during password change",
        {
          originalError: error instanceof Error ? error.message : error,
          userId: id,
          requesterId,
          requestId,
        }
      );
    }
  }

  /**
   * Validate if requester can update this user
   */
  private async validateUpdateAuthorization(
    userId: string,
    requesterId: string,
    requestId: string
  ): Promise<void> {
    // For now: users can only update themselves
    // Future: add admin role check
    if (userId !== requesterId) {
      logger.warn("⚠️ [UserUpdateService] Update authorization failed", {
        userId,
        requesterId,
        requestId,
        module: "UserUpdateService",
        action: "authorization_failed",
      });

      throw new UserUpdateForbiddenError(userId, requesterId, { requestId });
    }
  }

  /**
   * Check if email already exists (excluding current user)
   */
  private async validateEmailUniqueness(
    email: string,
    currentUserId: string,
    requestId: string
  ): Promise<void> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser && existingUser.id !== currentUserId) {
        logger.warn("⚠️ [UserUpdateService] Email already exists", {
          email,
          currentUserId,
          existingUserId: existingUser.id,
          requestId,
          module: "UserUpdateService",
          action: "email_conflict",
        });

        throw new UserAlreadyExistsError(email, { currentUserId, requestId });
      }
    } catch (error) {
      // Re-throw UserAlreadyExistsError as-is
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }

      throw new UserOperationFailedError(
        "email_uniqueness_check",
        `Failed to validate email uniqueness: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          email,
          currentUserId,
          requestId,
          originalError: error instanceof Error ? error.message : error,
        }
      );
    }
  }

  /**
   * Verify current password
   */
  private async verifyCurrentPassword(
    userId: string,
    currentPassword: string,
    requestId: string
  ): Promise<void> {
    const userWithPassword =
      await this.userRepository.getUserWithPassword(userId);

    if (!userWithPassword) {
      logger.warn("User not found during password verification", {
        userId,
        requestId,
        module: "UserUpdateService",
        action: "verifyCurrentPassword_user_not_found",
      });
      throw new UserNotFoundError(userId);
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password
    );

    if (!isValid) {
      logger.warn("Invalid current password provided", {
        userId,
        requestId,
        module: "UserUpdateService",
        action: "verifyCurrentPassword_invalid",
      });
      throw new InvalidPasswordError("Current password is incorrect");
    }

    logger.info("Current password verified successfully", {
      userId,
      requestId,
      module: "UserUpdateService",
      action: "verifyCurrentPassword_success",
    });
  }

  /**
   * Hash password securely (reuse from UserCreationService)
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = 12;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new UserOperationFailedError(
        "password_hashing",
        `Failed to hash password: ${error instanceof Error ? error.message : "Unknown error"}`,
        { originalError: error instanceof Error ? error.message : error }
      );
    }
  }

  /**
   * Update user in cache
   */
  private async updateUserCache(
    user: SafeUser,
    requestId: string
  ): Promise<void> {
    try {
      // Reuse the cacheNewUser method since it does the same thing
      await userCacheService.cacheNewUser(user, requestId);
    } catch (cacheError) {
      // Log cache failure but don't fail the entire operation
      logger.warn("⚠️ [UserUpdateService] Cache update failed", {
        userId: user.id,
        email: user.email,
        error:
          cacheError instanceof Error
            ? cacheError.message
            : "Unknown cache error",
        requestId,
        module: "UserUpdateService",
        action: "cache_update_failure_graceful",
      });
    }
  }

  /**
   * Invalidate user cache after sensitive operations
   */
  private async invalidateUserCache(
    userId: string,
    requestId: string
  ): Promise<void> {
    try {
      // TODO: Implement cache invalidation in userCacheService
      logger.info("🗑️ [UserUpdateService] Cache invalidation needed", {
        userId,
        requestId,
        module: "UserUpdateService",
        action: "cache_invalidation_placeholder",
      });
    } catch (cacheError) {
      logger.warn("⚠️ [UserUpdateService] Cache invalidation failed", {
        userId,
        error:
          cacheError instanceof Error
            ? cacheError.message
            : "Unknown cache error",
        requestId,
        module: "UserUpdateService",
        action: "cache_invalidation_failure",
      });
    }
  }
}

// Export factory function for dependency injection
export const createUserUpdateService = (userRepository: IUserRepository) =>
  new UserUpdateService(userRepository);
