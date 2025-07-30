/**
 * Cache Utilities
 * Helper functions for key generation and data serialization
 */

import { logger } from "../../logger/config.js";
import { DEFAULT_CACHE_OPTIONS, CACHE_CONSTANTS } from "../config/defaults.js";

/**
 * Generate cache key with prefix and normalization
 */
export const generateCacheKey = (
  key: string | string[],
  prefix: string = DEFAULT_CACHE_OPTIONS.prefix
): string => {
  const keyString = Array.isArray(key) ? key.join(":") : key;
  const normalizedKey = keyString.toLowerCase().replace(/[^a-z0-9:_-]/g, "_");
  return `${prefix}:${normalizedKey}`;
};

/**
 * Serialize data for storage
 */
export const serializeData = (data: any, serialize: boolean): string => {
  if (!serialize) {
    return String(data);
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    logger.warn("Failed to serialize cache data", {
      error: error instanceof Error ? error.message : "Unknown error",
      module: "cache",
      action: "serialize",
    });
    return String(data);
  }
};

/**
 * Deserialize data from storage
 */
export const deserializeData = <T>(data: string, serialize: boolean): T => {
  if (!serialize) {
    return data as unknown as T;
  }

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    logger.warn("Failed to deserialize cache data", {
      error: error instanceof Error ? error.message : "Unknown error",
      data: data.substring(0, CACHE_CONSTANTS.SERIALIZATION_PREVIEW_LENGTH),
      module: "cache",
      action: "deserialize",
    });
    return data as unknown as T;
  }
};
