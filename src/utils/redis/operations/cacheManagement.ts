import {
  deleteCache,
  invalidateCachePattern,
  setCache,
  getCache,
} from "../cache.js";
import { logger } from "../../logger/config.js";
import { UserCacheKeys } from "../keys/userKeys.js";
import {
  USER_CACHE_CONFIG,
  USER_LIST_CACHE_CONFIG,
} from "../config/cacheConfig.js";

/**
 * User Cache Management
 * Cache invalidation, warming, and maintenance operations
 */

export const invalidateUserCache = async (
  userId: string,
  email?: string,
  traceId?: string
): Promise<void> => {
  const invalidationPromises: Promise<any>[] = [];

  // Invalidate user by ID
  invalidationPromises.push(
    deleteCache(UserCacheKeys.byId(userId), USER_CACHE_CONFIG)
  );

  // Invalidate user profile
  invalidationPromises.push(
    deleteCache(UserCacheKeys.profile(userId), USER_CACHE_CONFIG)
  );

  // Invalidate user permissions
  invalidationPromises.push(
    deleteCache(UserCacheKeys.permissions(userId), USER_CACHE_CONFIG)
  );

  // Invalidate user by email if provided
  if (email) {
    invalidationPromises.push(
      deleteCache(UserCacheKeys.byEmail(email), USER_CACHE_CONFIG)
    );
  }

  // Invalidate all user lists (they might contain this user)
  invalidationPromises.push(
    invalidateCachePattern("users:list:*", USER_LIST_CACHE_CONFIG)
  );

  // Invalidate user sessions
  invalidationPromises.push(
    invalidateCachePattern(`user:session:${userId}:*`, USER_CACHE_CONFIG)
  );

  try {
    await Promise.allSettled(invalidationPromises);

    logger.info("User cache invalidation completed", {
      userId,
      email,
      traceId,
      module: "userCache",
      action: "invalidateUserCache",
    });
  } catch (error) {
    logger.error("User cache invalidation failed", {
      userId,
      email,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      module: "userCache",
      action: "invalidateUserCacheError",
    });
  }
};

export const warmUserCache = async (
  userId: string,
  userData: any,
  email?: string,
  traceId?: string
): Promise<void> => {
  const warmupPromises: Promise<any>[] = [];

  // Cache user by ID
  warmupPromises.push(
    setCache(UserCacheKeys.byId(userId), userData, USER_CACHE_CONFIG)
  );

  // Cache user by email if provided
  if (email) {
    warmupPromises.push(
      setCache(UserCacheKeys.byEmail(email), userData, USER_CACHE_CONFIG)
    );
  }

  try {
    await Promise.allSettled(warmupPromises);

    logger.debug("User cache warmup completed", {
      userId,
      email,
      traceId,
      module: "userCache",
      action: "warmUserCache",
    });
  } catch (error) {
    logger.warn("User cache warmup failed", {
      userId,
      email,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      module: "userCache",
      action: "warmUserCacheError",
    });
  }
};

export const getCachedUser = async <T>(
  userId: string,
  traceId?: string
): Promise<T | null> => {
  const cacheKey = UserCacheKeys.byId(userId);

  const result = await getCache<T>(cacheKey, USER_CACHE_CONFIG);

  if (!result.success) {
    logger.warn("Failed to get cached user", {
      userId,
      traceId,
      error: result.error,
      module: "userCache",
      action: "getCachedUserError",
    });
    return null;
  }

  return result.data || null;
};
