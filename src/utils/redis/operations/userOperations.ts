import { cacheAside } from "../cache.js";
import { logger } from "../../logger/config.js";
import { UserCacheKeys } from "../keys/userKeys.js";
import {
  USER_CACHE_CONFIG,
  USER_LIST_CACHE_CONFIG,
} from "../config/cacheConfig.js";

/**
 * Core User Caching Operations
 * Basic cache-aside patterns for user data
 */

export const cacheUserById = async <T>(
  userId: string,
  fetchFunction: () => Promise<T>,
  traceId?: string
): Promise<{ data: T; fromCache: boolean; latency: number }> => {
  const cacheKey = UserCacheKeys.byId(userId);

  logger.debug("Caching user by ID", {
    userId,
    traceId,
    cacheKey: cacheKey.join(":"),
    module: "userCache",
    action: "cacheUserById",
  });

  const result = await cacheAside(cacheKey, fetchFunction, USER_CACHE_CONFIG);

  if (!result.success) {
    logger.error("User cache operation failed", {
      userId,
      traceId,
      error: result.error,
      module: "userCache",
      action: "cacheUserByIdError",
    });
    throw new Error(result.error || "Cache operation failed");
  }

  logger.debug("User cache operation completed", {
    userId,
    traceId,
    fromCache: result.fromCache,
    latency: result.latency,
    module: "userCache",
    action: "cacheUserByIdSuccess",
  });

  return {
    data: result.data!,
    fromCache: result.fromCache || false,
    latency: result.latency || 0,
  };
};

export const cacheUserByEmail = async <T>(
  email: string,
  fetchFunction: () => Promise<T>,
  traceId?: string
): Promise<{ data: T; fromCache: boolean; latency: number }> => {
  const cacheKey = UserCacheKeys.byEmail(email);

  logger.debug("Caching user by email", {
    email,
    traceId,
    cacheKey: cacheKey.join(":"),
    module: "userCache",
    action: "cacheUserByEmail",
  });

  const result = await cacheAside(cacheKey, fetchFunction, USER_CACHE_CONFIG);

  if (!result.success) {
    logger.error("User email cache operation failed", {
      email,
      traceId,
      error: result.error,
      module: "userCache",
      action: "cacheUserByEmailError",
    });
    throw new Error(result.error || "Cache operation failed");
  }

  return {
    data: result.data!,
    fromCache: result.fromCache || false,
    latency: result.latency || 0,
  };
};

export const cacheUserList = async <T>(
  filters: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  },
  fetchFunction: () => Promise<T>,
  traceId?: string
): Promise<{ data: T; fromCache: boolean; latency: number }> => {
  const cacheKey = UserCacheKeys.list(filters);

  logger.debug("Caching user list", {
    filters,
    traceId,
    cacheKey: cacheKey.join(":"),
    module: "userCache",
    action: "cacheUserList",
  });

  const result = await cacheAside(
    cacheKey,
    fetchFunction,
    USER_LIST_CACHE_CONFIG
  );

  if (!result.success) {
    logger.error("User list cache operation failed", {
      filters,
      traceId,
      error: result.error,
      module: "userCache",
      action: "cacheUserListError",
    });
    throw new Error(result.error || "Cache operation failed");
  }

  return {
    data: result.data!,
    fromCache: result.fromCache || false,
    latency: result.latency || 0,
  };
};
