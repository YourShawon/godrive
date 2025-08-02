/**
 * User Read Repository - Extracted database read operations
 * Handles all SELECT/FIND operations for users
 *
 * Single Responsibility: User data retrieval only
 */

import { prisma } from "../../../../config/db.js";
import { logger } from "../../../../utils/logger/config.js";
import {
  SafeUser,
  UserWithPassword,
} from "../../interfaces/user.repository.interface.js";

export class UserReadRepository {
  /**
   * Find a user by their MongoDB ObjectId
   */
  async findById(id: string): Promise<SafeUser | null> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserReadRepository] Starting findById", {
      userId: id,
      module: "UserReadRepository",
      action: "findById_start",
    });

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      const duration = Date.now() - startTime;

      if (user) {
        const { password, ...safeUser } = user;

        logger.info("✅ [UserReadRepository] User found", {
          userId: id,
          userName: user.name,
          userRole: user.role,
          duration: `${duration}ms`,
          module: "UserReadRepository",
          action: "findById_success",
        });

        return safeUser as SafeUser;
      } else {
        logger.info("❌ [UserReadRepository] User not found", {
          userId: id,
          duration: `${duration}ms`,
          module: "UserReadRepository",
          action: "findById_not_found",
        });

        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserReadRepository] Database error in findById", {
        userId: id,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserReadRepository",
        action: "findById_error",
      });

      throw new Error(
        `Database error finding user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Find a user by email address
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserReadRepository] Starting findByEmail", {
      email,
      module: "UserReadRepository",
      action: "findByEmail_start",
    });

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      const duration = Date.now() - startTime;

      if (user) {
        const { password, ...safeUser } = user;

        logger.info("✅ [UserReadRepository] User found by email", {
          email,
          userId: user.id,
          userName: user.name,
          duration: `${duration}ms`,
          module: "UserReadRepository",
          action: "findByEmail_success",
        });

        return safeUser as SafeUser;
      } else {
        logger.info("❌ [UserReadRepository] User not found by email", {
          email,
          duration: `${duration}ms`,
          module: "UserReadRepository",
          action: "findByEmail_not_found",
        });

        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserReadRepository] Database error in findByEmail", {
        email,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserReadRepository",
        action: "findByEmail_error",
      });

      throw new Error(
        `Database error finding user by email: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get user with password for authentication operations
   * WARNING: Only use for password verification - never expose password in responses
   */
  async getUserWithPassword(id: string): Promise<UserWithPassword | null> {
    const startTime = Date.now();

    logger.info("Finding user with password for authentication", {
      userId: id,
      module: "UserReadRepository",
      action: "getUserWithPassword_start",
    });

    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          password: true, // Only select what we need for auth
        },
      });

      const duration = Date.now() - startTime;

      if (user) {
        logger.info("User with password found for authentication", {
          userId: id,
          module: "UserReadRepository",
          action: "getUserWithPassword_success",
          duration: `${duration}ms`,
        });
        return user;
      } else {
        logger.warn("User not found for password authentication", {
          userId: id,
          module: "UserReadRepository",
          action: "getUserWithPassword_not_found",
          duration: `${duration}ms`,
        });
        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Failed to get user with password", {
        userId: id,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UserReadRepository",
        action: "getUserWithPassword_error",
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Future read methods:
  // async findMany(options: FindManyOptions): Promise<SafeUser[]>
  // async findByRole(role: Role): Promise<SafeUser[]>
  // async search(query: string): Promise<SafeUser[]>
  // async count(): Promise<number>
}

// Export factory function
export const createUserReadRepository = () => new UserReadRepository();
