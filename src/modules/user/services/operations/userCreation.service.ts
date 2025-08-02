/**
 * User Creation Service - Extracted from main UserService
 * Handles all user creation business logic
 *
 * Single Responsibility: User creation only
 */

import bcrypt from "bcryptjs";
import { logger } from "../../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
  CreateUserData,
} from "../../interfaces/user.repository.interface.js";
import { CreateUserInput } from "../../schemas/createUser.schema.js";
import { userCacheService } from "../cache/userCache.service.js";
import {
  UserAlreadyExistsError,
  InvalidUserDataError,
  UserOperationFailedError,
} from "../../errors/index.js";

export class UserCreationService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Create a new user with all business logic
   */
  async createUser(userData: CreateUserInput): Promise<SafeUser> {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info("🔧 [UserCreationService] Starting createUser", {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      requestId,
      module: "UserCreationService",
      action: "createUser_start",
    });

    try {
      // 1. Check if user already exists
      await this.validateEmailUniqueness(userData.email, requestId);

      // 2. Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // 3. Prepare data for repository
      const createData: CreateUserData = {
        ...userData,
        password: hashedPassword,
      };

      // 4. Create user in database
      const newUser = await this.userRepository.create(createData);

      // 5. Cache the new user (graceful failure)
      try {
        await userCacheService.cacheNewUser(newUser, requestId);
      } catch (cacheError) {
        // Log cache failure but don't fail the entire operation
        logger.warn("⚠️ [UserCreationService] Cache operation failed", {
          userId: newUser.id,
          email: newUser.email,
          error:
            cacheError instanceof Error
              ? cacheError.message
              : "Unknown cache error",
          requestId,
          module: "UserCreationService",
          action: "cache_failure_graceful",
        });
      }

      const duration = Date.now() - startTime;

      logger.info("✅ [UserCreationService] User created successfully", {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        duration: `${duration}ms`,
        requestId,
        module: "UserCreationService",
        action: "createUser_success",
      });

      return newUser;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserCreationService] Error in createUser", {
        email: userData.email,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        requestId,
        module: "UserCreationService",
        action: "createUser_error",
      });

      // Re-throw known service errors as-is
      if (
        error instanceof UserAlreadyExistsError ||
        error instanceof InvalidUserDataError ||
        error instanceof UserOperationFailedError
      ) {
        throw error;
      }

      // Wrap unknown database/service errors
      throw new UserOperationFailedError(
        "create_user",
        error instanceof Error
          ? error.message
          : "Unknown error occurred during user creation",
        {
          originalError: error instanceof Error ? error.message : error,
          email: userData.email,
          requestId,
        }
      );
    }
  }

  /**
   * Check if email already exists
   */
  private async validateEmailUniqueness(
    email: string,
    requestId: string
  ): Promise<void> {
    try {
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        logger.warn("⚠️ [UserCreationService] User already exists", {
          email,
          requestId,
          module: "UserCreationService",
          action: "createUser_duplicate_email",
        });

        // Throw our specific error class instead of generic Error
        throw new UserAlreadyExistsError(email, { requestId });
      }
    } catch (error) {
      // Re-throw UserAlreadyExistsError as-is
      if (error instanceof UserAlreadyExistsError) {
        throw error;
      }

      // Wrap database/repository errors
      throw new UserOperationFailedError(
        "email_uniqueness_check",
        `Failed to validate email uniqueness: ${error instanceof Error ? error.message : "Unknown error"}`,
        {
          email,
          requestId,
          originalError: error instanceof Error ? error.message : error,
        }
      );
    }
  }

  /**
   * Hash password securely
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
}

// Export factory function for dependency injection
export const createUserCreationService = (userRepository: IUserRepository) =>
  new UserCreationService(userRepository);
