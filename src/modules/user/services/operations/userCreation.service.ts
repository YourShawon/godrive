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

      // 5. Cache the new user
      await userCacheService.cacheNewUser(newUser, requestId);

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

      throw error;
    }
  }

  /**
   * Check if email already exists
   */
  private async validateEmailUniqueness(
    email: string,
    requestId: string
  ): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn("⚠️ [UserCreationService] User already exists", {
        email,
        requestId,
        module: "UserCreationService",
        action: "createUser_duplicate_email",
      });
      throw new Error("User with this email already exists");
    }
  }

  /**
   * Hash password securely
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
}

// Export factory function for dependency injection
export const createUserCreationService = (userRepository: IUserRepository) =>
  new UserCreationService(userRepository);
