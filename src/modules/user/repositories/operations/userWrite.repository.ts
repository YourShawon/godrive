/**
 * User Write Repository - Extracted database write operations
 * Handles all INSERT/UPDATE/DELETE operations for users
 *
 * Single Responsibility: User data modification only
 */

import { prisma } from "../../../../config/db.js";
import { logger } from "../../../../utils/logger/config.js";
import {
  SafeUser,
  CreateUserData,
} from "../../interfaces/user.repository.interface.js";

export class UserWriteRepository {
  /**
   * Create a new user in the database
   */
  async create(userData: CreateUserData): Promise<SafeUser> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserWriteRepository] Starting create", {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      module: "UserWriteRepository",
      action: "create_start",
    });

    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: userData.password, // Already hashed by service
          name: userData.name,
          role: userData.role,
          language: userData.language || "en",
          currency: userData.currency || "USD",
          // Optional fields with proper handling
          ...(userData.preferredCarTypes &&
            userData.preferredCarTypes.length > 0 && {
              preferredCarTypes: userData.preferredCarTypes,
            }),
        },
      });

      const duration = Date.now() - startTime;
      const { password, ...safeUser } = user;

      logger.info("✅ [UserWriteRepository] User created successfully", {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        duration: `${duration}ms`,
        module: "UserWriteRepository",
        action: "create_success",
      });

      return safeUser as SafeUser;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserWriteRepository] Database error in create", {
        email: userData.email,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserWriteRepository",
        action: "create_error",
      });

      // Handle specific Prisma errors
      if (error instanceof Error && error.message.includes("email")) {
        throw new Error("Email already exists");
      }

      throw new Error(
        `Database error creating user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Future write methods:
  // async update(id: string, userData: UpdateUserData): Promise<SafeUser | null>
  // async delete(id: string): Promise<boolean>
  // async updatePassword(id: string, hashedPassword: string): Promise<boolean>
  // async deactivate(id: string): Promise<boolean>
  // async updateLastLogin(id: string): Promise<boolean>
}

// Export factory function
export const createUserWriteRepository = () => new UserWriteRepository();
