// User Repository Implementation - Prisma database operations

import { prisma } from "../../../config/db.js";
import { logger } from "../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
} from "../interfaces/user.repository.interface.js";

/**
 * Prisma-based User Repository
 * Implements IUserRepository interface using Prisma ORM
 */
export class UserRepository implements IUserRepository {
  /**
   * Find a user by MongoDB ObjectId
   * @param id - Valid MongoDB ObjectId string (validated by middleware)
   * @returns Promise<SafeUser | null>
   */
  async findById(id: string): Promise<SafeUser | null> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserRepository] Starting findById", {
      userId: id,
      module: "UserRepository",
      action: "findById_start",
    });

    try {
      // Prisma query to find user by ObjectId
      const user = await prisma.user.findUnique({
        where: {
          id: id, // MongoDB ObjectId
        },
      });

      const duration = Date.now() - startTime;

      if (user) {
        // Remove password before returning
        const { password, ...safeUser } = user;

        logger.info("✅ [UserRepository] User found", {
          userId: id,
          userName: user.name,
          userRole: user.role,
          duration: `${duration}ms`,
          module: "UserRepository",
          action: "findById_success",
        });

        return safeUser as SafeUser;
      } else {
        logger.info("❌ [UserRepository] User not found", {
          userId: id,
          duration: `${duration}ms`,
          module: "UserRepository",
          action: "findById_not_found",
        });

        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserRepository] Database error in findById", {
        userId: id,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserRepository",
        action: "findById_error",
      });

      // Re-throw the error to be handled by service layer
      throw new Error(
        `Database error finding user: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
