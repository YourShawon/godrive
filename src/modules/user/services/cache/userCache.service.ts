/**
 * User Cache Service - Extracted from main UserService
 * Handles all Redis caching operations for users
 *
 * Single Responsibility: User caching logic only
 */

import { logger } from "../../../../utils/logger/config.js";
import { SafeUser } from "../../interfaces/user.repository.interface.js";
import { cacheUserById } from "../../../../utils/redis/operations/userOperations.js";

export class UserCacheService {
  /**
   * Get user from cache or fallback to database
   */
  async getCachedUser(
    userId: string,
    fallbackFn: () => Promise<SafeUser | null>,
    correlationId: string
  ): Promise<{ user: SafeUser | null; fromCache: boolean; latency: number }> {
    logger.debug("🗄️ [UserCacheService] Checking Redis cache", {
      userId,
      correlationId,
      module: "UserCacheService",
      action: "cache_lookup",
    });

    const cacheResult = await cacheUserById(userId, fallbackFn, correlationId);

    return {
      user: cacheResult.data,
      fromCache: cacheResult.fromCache,
      latency: cacheResult.latency,
    };
  }

  /**
   * Cache a newly created user
   */
  async cacheNewUser(user: SafeUser, requestId: string): Promise<void> {
    try {
      await cacheUserById(user.id, async () => user, requestId);
      logger.debug("📦 [UserCacheService] User cached successfully", {
        userId: user.id,
        requestId,
        module: "UserCacheService",
        action: "cache_success",
      });
    } catch (cacheError) {
      // Cache failure shouldn't fail the operation
      logger.warn("⚠️ [UserCacheService] Cache operation failed", {
        userId: user.id,
        error:
          cacheError instanceof Error
            ? cacheError.message
            : "Unknown cache error",
        requestId,
        module: "UserCacheService",
        action: "cache_failed",
      });
    }
  }
}

// Export singleton
export const userCacheService = new UserCacheService();
