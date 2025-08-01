// User Repository Implementation - Prisma database operations

import { prisma } from "../../../config/db.js";
import { logger } from "../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
  CreateUserData,
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

  /**
   * Find a user by email address
   * @param email - Normalized email address (lowercase, trimmed)
   * @returns Promise<SafeUser | null>
   */
  async findByEmail(email: string): Promise<SafeUser | null> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserRepository] Starting findByEmail", {
      email,
      module: "UserRepository",
      action: "findByEmail_start",
    });

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      const duration = Date.now() - startTime;

      if (user) {
        const { password, ...safeUser } = user;

        logger.info("✅ [UserRepository] User found by email", {
          email,
          userId: user.id,
          userName: user.name,
          duration: `${duration}ms`,
          module: "UserRepository",
          action: "findByEmail_success",
        });

        return safeUser as SafeUser;
      } else {
        logger.info("❌ [UserRepository] User not found by email", {
          email,
          duration: `${duration}ms`,
          module: "UserRepository",
          action: "findByEmail_not_found",
        });

        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserRepository] Database error in findByEmail", {
        email,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserRepository",
        action: "findByEmail_error",
      });

      throw new Error(
        `Database error finding user by email: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Create a new user in the database
   * @param userData - User data with hashed password
   * @returns Promise<SafeUser> - Created user (excludes password)
   */
  async create(userData: CreateUserData): Promise<SafeUser> {
    const startTime = Date.now();

    logger.debug("🗄️ [UserRepository] Starting create", {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      module: "UserRepository",
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

      logger.info("✅ [UserRepository] User created successfully", {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        duration: `${duration}ms`,
        module: "UserRepository",
        action: "create_success",
      });

      return safeUser as SafeUser;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserRepository] Database error in create", {
        email: userData.email,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserRepository",
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
}

// Export singleton instance
export const userRepository = new UserRepository();
