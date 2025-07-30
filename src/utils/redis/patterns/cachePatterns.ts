/**
 * Cache Patterns
 * Higher-level caching patterns and strategies
 */

import { getRedisClient } from "../client.js";
import { logger } from "../../logger/config.js";
import { CacheResult, CacheOptions } from "../types/interfaces.js";
import { DEFAULT_CACHE_OPTIONS } from "../config/defaults.js";
import { generateCacheKey } from "../utils/helpers.js";
import { getCache, setCache } from "../operations/coreOperations.js";

/**
 * Cache-aside pattern: Get from cache or execute function and cache result
 */
export const cacheAside = async <T>(
  key: string | string[],
  fetchFunction: () => Promise<T>,
  options: CacheOptions = {}
): Promise<CacheResult<T>> => {
  const start = Date.now();

  // Try to get from cache first
  const cacheResult = await getCache<T>(key, options);

  if (
    cacheResult.success &&
    cacheResult.data !== null &&
    cacheResult.data !== undefined
  ) {
    return {
      success: true,
      data: cacheResult.data,
      fromCache: true,
      latency: Date.now() - start,
    };
  }

  try {
    // Cache miss or error - fetch data
    const freshData = await fetchFunction();

    // Cache the fresh data (fire and forget)
    setCache(key, freshData, options).catch((error: any) => {
      logger.warn("Failed to cache fresh data", {
        key: generateCacheKey(key, options.prefix),
        error: error instanceof Error ? error.message : "Unknown error",
        module: "cache",
        action: "cacheAsideSetError",
      });
    });

    return {
      success: true,
      data: freshData,
      fromCache: false,
      latency: Date.now() - start,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache-aside fetch function failed", {
      key: generateCacheKey(key, options.prefix),
      error: errorMessage,
      latency: Date.now() - start,
      module: "cache",
      action: "cacheAsideError",
    });

    return {
      success: false,
      error: errorMessage,
      latency: Date.now() - start,
    };
  }
};

/**
 * Invalidate cache pattern by prefix or pattern
 */
export const invalidateCachePattern = async (
  pattern: string,
  options: CacheOptions = {}
): Promise<CacheResult<number>> => {
  const start = Date.now();
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const searchPattern = `${opts.prefix}:${pattern}`;

  try {
    const client = getRedisClient();

    // Get keys matching pattern
    const keys = await client.keys(searchPattern);

    if (keys.length === 0) {
      return {
        success: true,
        data: 0,
        latency: Date.now() - start,
      };
    }

    // Delete all matching keys
    const deletedCount = await client.del(...keys);
    const latency = Date.now() - start;

    logger.info("Cache pattern invalidation completed", {
      pattern: searchPattern,
      deletedCount,
      latency,
      module: "cache",
      action: "invalidatePattern",
    });

    return {
      success: true,
      data: deletedCount,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache pattern invalidation failed", {
      pattern: searchPattern,
      error: errorMessage,
      latency,
      module: "cache",
      action: "invalidatePatternError",
    });

    return {
      success: false,
      error: errorMessage,
      latency,
    };
  }
};
