/**
 * User Retrieval Service - Extracted from main UserService
 * Handles all user retrieval business logic
 *
 * Single Responsibility: User retrieval only
 */

import { logger } from "../../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
} from "../../interfaces/user.repository.interface.js";
import { UserServiceError } from "../../errors/user.service.errors.js";
import { userCacheService } from "../cache/userCache.service.js";

export class UserRetrievalService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Get user by ID with caching
   */
  async getUserById(id: string): Promise<SafeUser | null> {
    const startTime = Date.now();
    const correlationId = `getUserById_${id}_${Date.now()}`;

    logger.info("🔍 [UserRetrievalService] Starting getUserById", {
      userId: id,
      correlationId,
      module: "UserRetrievalService",
      action: "getUserById_start",
    });

    try {
      // Input validation
      this.validateUserId(id, correlationId);

      // Get from cache or database
      const { user, fromCache, latency } = await userCacheService.getCachedUser(
        id,
        () => this.userRepository.findById(id),
        correlationId
      );

      const totalDuration = Date.now() - startTime;

      if (!user) {
        logger.info("❌ [UserRetrievalService] User not found", {
          userId: id,
          correlationId,
          fromCache,
          cacheLatency: `${latency}ms`,
          totalDuration: `${totalDuration}ms`,
          module: "UserRetrievalService",
          action: "user_not_found",
        });
        return null;
      }

      logger.info("✅ [UserRetrievalService] User retrieved successfully", {
        userId: id,
        userName: user.name,
        userRole: user.role,
        correlationId,
        performanceMetrics: {
          fromCache,
          cacheLatency: `${latency}ms`,
          totalDuration: `${totalDuration}ms`,
          speedup: fromCache
            ? `${Math.round((100 / latency) * 10)}x faster`
            : "initial fetch",
        },
        module: "UserRetrievalService",
        action: "getUserById_success",
      });

      return user;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof UserServiceError) {
        logger.error("❌ [UserRetrievalService] Service error", {
          userId: id,
          correlationId,
          duration: `${duration}ms`,
          error: error.message,
          module: "UserRetrievalService",
          action: "getUserById_service_error",
        });
        throw error;
      }

      logger.error("❌ [UserRetrievalService] Unexpected error", {
        userId: id,
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserRetrievalService",
        action: "getUserById_system_error",
      });

      throw new UserServiceError(
        "Failed to retrieve user due to system error",
        {
          originalError: error instanceof Error ? error.message : "Unknown",
          userId: id,
          correlationId,
          duration: `${duration}ms`,
        }
      );
    }
  }

  /**
   * Validate user ID input
   */
  private validateUserId(id: string, correlationId: string): void {
    if (!id || typeof id !== "string") {
      throw new UserServiceError("Invalid user ID provided", {
        providedId: id,
        expectedType: "string",
        correlationId,
      });
    }
  }
}

// Export factory function for dependency injection
export const createUserRetrievalService = (userRepository: IUserRepository) =>
  new UserRetrievalService(userRepository);
