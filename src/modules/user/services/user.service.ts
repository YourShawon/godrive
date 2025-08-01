// User Service Implementation - Business logic layer

import { logger } from "../../../utils/logger/config.js";
import {
  IUserRepository,
  SafeUser,
} from "../interfaces/user.repository.interface.js";
import { IUserService } from "../interfaces/user.service.interface.js";
import {
  UserNotFoundError,
  UserServiceError,
} from "../errors/user.service.errors.js";
import {
  UserHATEOAS,
  HATEOASBuilder,
  HATEOASResponse,
} from "../../../utils/hateoas/hateoas.utils.js";
import { cacheUserById } from "../../../utils/redis/operations/userOperations.js";

/**
 * User Service Implementation
 *
 * Applied:
 * - Dependency injection for testability
 * - Comprehensive logging for observability
 * - Custom error types for precise error handling
 * - Performance monitoring with timing
 * - Structured logging with correlation IDs
 * - Single responsibility principle
 */
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {
    logger.info("🏗️ UserService initialized", {
      module: "UserService",
      action: "constructor",
    });
  }

  /**
   * Retrieve a user by their MongoDB ObjectId with Redis Caching
   *
   * Enhanced Business Logic Flow:
   * 1. Validate input (defensive programming)
   * 2. Try Redis cache first (Cache-Aside pattern)
   * 3. If cache miss, fetch from repository
   * 4. Store result in cache for future requests
   * 5. Business rule validation
   * 6. Audit logging with cache metrics
   * 7. Return sanitized user data
   *
   * Performance: Cache hit ~1-5ms vs DB query ~50-100ms
   *
   * @param id - Valid MongoDB ObjectId
   * @returns Promise<SafeUser | null>
   */
  async getUserById(id: string): Promise<SafeUser | null> {
    const startTime = Date.now();
    const correlationId = `getUserById_${id}_${Date.now()}`;

    logger.info(
      "🔍 [UserService] Starting getUserById operation with caching",
      {
        userId: id,
        correlationId,
        module: "UserService",
        action: "getUserById_start",
      }
    );

    try {
      // Step 1: Input validation (defensive programming)
      if (!id || typeof id !== "string") {
        throw new UserServiceError("Invalid user ID provided", {
          providedId: id,
          expectedType: "string",
          correlationId,
        });
      }

      // Step 2: Cache-Aside Pattern - Try cache first, then database
      logger.debug("🗄️ [UserService] Checking Redis cache", {
        userId: id,
        correlationId,
        module: "UserService",
        action: "cache_lookup",
      });

      const cacheResult = await cacheUserById(
        id,
        // This function only runs on cache miss
        async () => {
          logger.debug("� [UserService] Cache miss - fetching from database", {
            userId: id,
            correlationId,
            module: "UserService",
            action: "database_fallback",
          });

          return await this.userRepository.findById(id);
        },
        correlationId
      );

      const { data: user, fromCache, latency } = cacheResult;
      const totalDuration = Date.now() - startTime;

      // Step 3: Business logic - Check if user exists
      if (!user) {
        logger.info("❌ [UserService] User not found", {
          userId: id,
          correlationId,
          fromCache,
          cacheLatency: `${latency}ms`,
          totalDuration: `${totalDuration}ms`,
          module: "UserService",
          action: "user_not_found",
        });

        return null;
      }

      // Step 4: Business rules validation (future: active status, permissions)
      // This is where you'd add business-specific validation

      // Step 5: Success logging with enhanced cache metrics
      logger.info("✅ [UserService] User retrieved successfully with caching", {
        userId: id,
        userName: user.name,
        userRole: user.role,
        correlationId,
        // Performance metrics
        performanceMetrics: {
          fromCache,
          cacheLatency: `${latency}ms`,
          totalDuration: `${totalDuration}ms`,
          speedup: fromCache
            ? `${Math.round((100 / latency) * 10)}x faster`
            : "initial fetch",
        },
        module: "UserService",
        action: "getUserById_success",
        // Business metrics
        businessMetrics: {
          userActive: true,
          lastAccess: new Date().toISOString(),
          cacheEfficiency: fromCache ? "hit" : "miss",
        },
      });

      // Step 6: Return user data (already sanitized by repository)
      return user;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Enhanced error handling with cache context
      if (error instanceof UserServiceError) {
        logger.error("❌ [UserService] Service error occurred", {
          userId: id,
          correlationId,
          duration: `${duration}ms`,
          error: error.message,
          errorCode: error.errorCode,
          module: "UserService",
          action: "getUserById_service_error",
        });
        throw error;
      }

      // Handle cache-specific errors gracefully
      logger.error("❌ [UserService] Unexpected error in getUserById", {
        userId: id,
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        cacheRelated:
          error instanceof Error &&
          (error.message?.includes("redis") ||
            error.message?.includes("cache")),
        module: "UserService",
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
   * Retrieve a user by their MongoDB ObjectId with HATEOAS links
   *
   * Enhanced version that includes hypermedia links for Level 3 REST maturity.
   * Provides self-descriptive API responses with available actions.
   *
   * @param id - Valid MongoDB ObjectId
   * @returns Promise<HATEOASResponse<SafeUser> | null>
   */
  async getUserByIdWithLinks(
    id: string
  ): Promise<HATEOASResponse<SafeUser> | null> {
    const startTime = Date.now();
    const correlationId = `getUserByIdWithLinks_${id}_${Date.now()}`;

    logger.info("🔗 [UserService] Starting getUserByIdWithLinks operation", {
      userId: id,
      correlationId,
      module: "UserService",
      action: "getUserByIdWithLinks_start",
    });

    try {
      // Get user data using existing method
      const user = await this.getUserById(id);

      if (!user) {
        return null;
      }

      // Generate HATEOAS links based on user data
      const links = UserHATEOAS.generateUserLinks(user.id, user.role);

      // Build HATEOAS response
      const hateoasResponse = HATEOASBuilder.buildResponse(user, links, {
        correlationId,
        processedBy: "service-layer",
        cached: "handled-by-getUserById", // Caching handled by underlying method
        userRole: user.role,
        availableActions: Object.keys(links).length,
      });

      const duration = Date.now() - startTime;

      logger.info(
        "✅ [UserService] User with HATEOAS links retrieved successfully",
        {
          userId: id,
          userName: user.name,
          userRole: user.role,
          linksGenerated: Object.keys(links).length,
          correlationId,
          duration: `${duration}ms`,
          module: "UserService",
          action: "getUserByIdWithLinks_success",
        }
      );

      return hateoasResponse;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error("❌ [UserService] Error in getUserByIdWithLinks", {
        userId: id,
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "UserService",
        action: "getUserByIdWithLinks_error",
      });

      // Re-throw the error (it's already properly handled by getUserById)
      throw error;
    }
  }

  // Future service methods will be added here following the same patterns:
  // async getUserByEmail(email: string): Promise<SafeUser | null>
  // async createUser(userData: CreateUserData): Promise<SafeUser>
  // etc.
}

// Export singleton instance with dependency injection
import { userRepository } from "../repositories/user.repository.js";
export const userService = new UserService(userRepository);
