/**
 * Core Cache Operations
 * Basic cache operations: get, set, delete, exists
 */

import { getRedisClient } from "../client.js";
import { logger } from "../../logger/config.js";
import { CacheResult, CacheOptions } from "../types/interfaces.js";
import { DEFAULT_CACHE_OPTIONS } from "../config/defaults.js";
import {
  generateCacheKey,
  serializeData,
  deserializeData,
} from "../utils/helpers.js";

/**
 * Set cache value with options
 */
export const setCache = async <T>(
  key: string | string[],
  value: T,
  options: CacheOptions = {}
): Promise<CacheResult<boolean>> => {
  const start = Date.now();
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(key, opts.prefix);

  try {
    const client = getRedisClient();
    const serializedValue = serializeData(value, opts.serialize);

    let result: string | null;
    if (opts.ttl > 0) {
      result = await client.setex(cacheKey, opts.ttl, serializedValue);
    } else {
      result = await client.set(cacheKey, serializedValue);
    }

    const latency = Date.now() - start;
    const success = result === "OK";

    if (success) {
      logger.debug("Cache set successful", {
        key: cacheKey,
        ttl: opts.ttl,
        latency,
        module: "cache",
        action: "set",
      });
    }

    return {
      success,
      data: success,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache set failed", {
      key: cacheKey,
      error: errorMessage,
      latency,
      module: "cache",
      action: "setError",
    });

    return {
      success: false,
      error: errorMessage,
      latency,
    };
  }
};

/**
 * Get cache value with options
 */
export const getCache = async <T>(
  key: string | string[],
  options: CacheOptions = {}
): Promise<CacheResult<T | null>> => {
  const start = Date.now();
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(key, opts.prefix);

  try {
    const client = getRedisClient();
    const cachedValue = await client.get(cacheKey);
    const latency = Date.now() - start;

    if (cachedValue === null) {
      logger.debug("Cache miss", {
        key: cacheKey,
        latency,
        module: "cache",
        action: "miss",
      });

      return {
        success: true,
        data: null,
        fromCache: false,
        latency,
      };
    }

    const deserializedValue = deserializeData<T>(cachedValue, opts.serialize);

    logger.debug("Cache hit", {
      key: cacheKey,
      latency,
      module: "cache",
      action: "hit",
    });

    return {
      success: true,
      data: deserializedValue,
      fromCache: true,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache get failed", {
      key: cacheKey,
      error: errorMessage,
      latency,
      module: "cache",
      action: "getError",
    });

    return {
      success: false,
      error: errorMessage,
      latency,
    };
  }
};

/**
 * Delete cache key(s)
 */
export const deleteCache = async (
  key: string | string[],
  options: CacheOptions = {}
): Promise<CacheResult<number>> => {
  const start = Date.now();
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(key, opts.prefix);

  try {
    const client = getRedisClient();
    const deletedCount = await client.del(cacheKey);
    const latency = Date.now() - start;

    logger.debug("Cache delete completed", {
      key: cacheKey,
      deletedCount,
      latency,
      module: "cache",
      action: "delete",
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

    logger.error("Cache delete failed", {
      key: cacheKey,
      error: errorMessage,
      latency,
      module: "cache",
      action: "deleteError",
    });

    return {
      success: false,
      error: errorMessage,
      latency,
    };
  }
};

/**
 * Check if cache key exists
 */
export const cacheExists = async (
  key: string | string[],
  options: CacheOptions = {}
): Promise<CacheResult<boolean>> => {
  const start = Date.now();
  const opts = { ...DEFAULT_CACHE_OPTIONS, ...options };
  const cacheKey = generateCacheKey(key, opts.prefix);

  try {
    const client = getRedisClient();
    const exists = await client.exists(cacheKey);
    const latency = Date.now() - start;

    return {
      success: true,
      data: exists === 1,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - start;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache exists check failed", {
      key: cacheKey,
      error: errorMessage,
      latency,
      module: "cache",
      action: "existsError",
    });

    return {
      success: false,
      error: errorMessage,
      latency,
    };
  }
};
