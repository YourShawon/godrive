import { setCache, getCache } from "../cache.js";
import { logger } from "../../logger/config.js";
import { UserCacheKeys } from "../keys/userKeys.js";
import { USER_CACHE_CONFIG } from "../config/cacheConfig.js";

/**
 * User Session Caching
 * Specialized operations for user session management
 */

export const cacheUserSession = async (
  userId: string,
  sessionId: string,
  sessionData: any,
  ttl: number = 86400, // 24 hours default
  traceId?: string
): Promise<boolean> => {
  const cacheKey = UserCacheKeys.session(userId, sessionId);

  const result = await setCache(cacheKey, sessionData, {
    ...USER_CACHE_CONFIG,
    ttl,
  });

  if (!result.success) {
    logger.error("Failed to cache user session", {
      userId,
      sessionId,
      traceId,
      error: result.error,
      module: "userCache",
      action: "cacheUserSessionError",
    });
    return false;
  }

  logger.debug("User session cached successfully", {
    userId,
    sessionId,
    ttl,
    traceId,
    module: "userCache",
    action: "cacheUserSession",
  });

  return true;
};

export const getCachedUserSession = async <T>(
  userId: string,
  sessionId: string,
  traceId?: string
): Promise<T | null> => {
  const cacheKey = UserCacheKeys.session(userId, sessionId);

  const result = await getCache<T>(cacheKey, USER_CACHE_CONFIG);

  if (!result.success || result.data === null) {
    logger.debug("User session cache miss", {
      userId,
      sessionId,
      traceId,
      module: "userCache",
      action: "getCachedUserSessionMiss",
    });
    return null;
  }

  logger.debug("User session cache hit", {
    userId,
    sessionId,
    traceId,
    fromCache: result.fromCache,
    module: "userCache",
    action: "getCachedUserSession",
  });

  return result.data || null;
};
