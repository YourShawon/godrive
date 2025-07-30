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

/**
 * User Service Implementation
 *
 * FAANG Standards Applied:
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
   * Retrieve a user by their MongoDB ObjectId
   *
   * Business Logic Flow:
   * 1. Validate input (already done by middleware, but defensive programming)
   * 2. Performance timing for monitoring
   * 3. Repository call with error handling
   * 4. Business rule validation (user active, permissions, etc.)
   * 5. Audit logging for business events
   * 6. Return sanitized user data
   *
   * @param id - Valid MongoDB ObjectId
   * @returns Promise<SafeUser | null>
   */
  async getUserById(id: string): Promise<SafeUser | null> {
    const startTime = Date.now();
    const correlationId = `getUserById_${id}_${Date.now()}`;

    logger.info("🔍 [UserService] Starting getUserById operation", {
      userId: id,
      correlationId,
      module: "UserService",
      action: "getUserById_start",
    });

    try {
      // Step 1: Input validation (defensive programming)
      if (!id || typeof id !== "string") {
        throw new UserServiceError("Invalid user ID provided", {
          providedId: id,
          expectedType: "string",
          correlationId,
        });
      }

      // Step 2: Repository call with performance monitoring
      logger.debug("📊 [UserService] Calling repository layer", {
        userId: id,
        correlationId,
        module: "UserService",
        action: "repository_call",
      });

      const user = await this.userRepository.findById(id);
      const duration = Date.now() - startTime;

      // Step 3: Business logic - Check if user exists
      if (!user) {
        logger.info("❌ [UserService] User not found in repository", {
          userId: id,
          correlationId,
          duration: `${duration}ms`,
          module: "UserService",
          action: "user_not_found",
        });

        // Return null instead of throwing error - let controller decide HTTP response
        return null;
      }

      // Step 4: Business rules validation (future: active status, permissions)
      // For now, we trust repository data, but this is where you'd add:
      // - User active status check
      // - Permission validation
      // - Business-specific rules

      // Step 5: Success logging with business metrics
      logger.info("✅ [UserService] User retrieved successfully", {
        userId: id,
        userName: user.name,
        userRole: user.role,
        correlationId,
        duration: `${duration}ms`,
        module: "UserService",
        action: "getUserById_success",
        // Business metrics
        businessMetrics: {
          userActive: true, // Future: actual status check
          lastAccess: new Date().toISOString(),
        },
      });

      // Step 6: Return user data (already sanitized by repository)
      return user;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Enhanced error handling with context
      if (error instanceof UserServiceError) {
        // Re-throw service errors as-is
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

      // Wrap repository/system errors
      logger.error("❌ [UserService] Unexpected error in getUserById", {
        userId: id,
        correlationId,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
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
        cached: false, // Future: implement caching
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
