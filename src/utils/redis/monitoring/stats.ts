/**
 * Cache Monitoring and Statistics
 * Health checks and performance monitoring for cache operations
 */

import { getRedisClient } from "../client.js";
import { logger } from "../../logger/config.js";
import { CacheStats } from "../types/interfaces.js";

/**
 * Get cache statistics and health information
 */
export const getCacheStats = async (): Promise<CacheStats> => {
  try {
    const client = getRedisClient();

    const info = await client.info("memory");
    const dbSize = await client.dbsize();

    // Parse memory info
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memory = memoryMatch?.[1]?.trim() || "Unknown";

    return {
      connected: true,
      memory,
      keyCount: dbSize,
    };
  } catch (error) {
    logger.error("Failed to get cache stats", {
      error: error instanceof Error ? error.message : "Unknown error",
      module: "cache",
      action: "statsError",
    });

    return {
      connected: false,
      memory: "Unknown",
      keyCount: 0,
    };
  }
};

/**
 * Perform cache health check
 */
export const performHealthCheck = async (): Promise<{
  healthy: boolean;
  latency?: number;
  error?: string;
}> => {
  const start = Date.now();

  try {
    const client = getRedisClient();
    await client.ping();

    const latency = Date.now() - start;

    return {
      healthy: true,
      latency,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logger.error("Cache health check failed", {
      error: errorMessage,
      latency: Date.now() - start,
      module: "cache",
      action: "healthCheckError",
    });

    return {
      healthy: false,
      error: errorMessage,
    };
  }
};
