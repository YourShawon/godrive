import Redis, { RedisOptions } from "ioredis";
import { logger } from "../logger/config.js";

/**
 * Redis Client Configuration
 * Redis setup with connection management, error handling, and monitoring
 */

// Redis configuration interface
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  connectTimeout?: number;
  commandTimeout?: number;
  family?: 4 | 6;
}

// Default Redis configuration
const defaultConfig: Partial<RedisConfig> = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379", 10),
  db: parseInt(process.env.REDIS_DB || "0", 10),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  family: 4,
};

// Add password if provided
if (process.env.REDIS_PASSWORD) {
  defaultConfig.password = process.env.REDIS_PASSWORD;
}

// Redis client instance
let redisClient: Redis | null = null;

/**
 * Create and configure Redis client
 */
export const createRedisClient = (config: Partial<RedisConfig> = {}): Redis => {
  const finalConfig: RedisOptions = {
    ...defaultConfig,
    ...config,

    // Reconnect on fail
    reconnectOnError: (err: Error) => {
      const targetError = "READONLY";
      return err.message.includes(targetError);
    },
  };

  const client = new Redis(finalConfig);

  // Connection event handlers
  client.on("connect", () => {
    logger.info("Redis client connecting", {
      host: finalConfig.host,
      port: finalConfig.port,
      db: finalConfig.db,
      module: "redis",
      action: "connecting",
    });
  });

  client.on("ready", () => {
    logger.info("Redis client connected successfully", {
      host: finalConfig.host,
      port: finalConfig.port,
      db: finalConfig.db,
      module: "redis",
      action: "connected",
    });
  });

  client.on("error", (error: Error) => {
    logger.error("Redis client error", {
      error: error.message,
      stack: error.stack,
      host: finalConfig.host,
      port: finalConfig.port,
      module: "redis",
      action: "error",
    });
  });

  client.on("close", () => {
    logger.warn("Redis client connection closed", {
      host: finalConfig.host,
      port: finalConfig.port,
      module: "redis",
      action: "disconnected",
    });
  });

  client.on("reconnecting", (delay: number) => {
    logger.info("Redis client reconnecting", {
      delay,
      host: finalConfig.host,
      port: finalConfig.port,
      module: "redis",
      action: "reconnecting",
    });
  });

  client.on("end", () => {
    logger.info("Redis client connection ended", {
      host: finalConfig.host,
      port: finalConfig.port,
      module: "redis",
      action: "ended",
    });
  });

  return client;
};

/**
 * Get Redis client instance (singleton pattern)
 */
export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
};

/**
 * Initialize Redis connection
 */
export const initializeRedis = async (): Promise<void> => {
  const client = getRedisClient();

  try {
    await client.connect();

    // Test connection with ping
    const pong = await client.ping();
    if (pong !== "PONG") {
      throw new Error("Redis ping test failed");
    }

    logger.info("Redis initialization successful", {
      module: "redis",
      action: "initialized",
    });
  } catch (error) {
    logger.error("Redis initialization failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "redis",
      action: "initializationFailed",
    });
    throw error;
  }
};

/**
 * Close Redis connection gracefully
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;

      logger.info("Redis connection closed gracefully", {
        module: "redis",
        action: "closed",
      });
    } catch (error) {
      logger.error("Error closing Redis connection", {
        error: error instanceof Error ? error.message : "Unknown error",
        module: "redis",
        action: "closeError",
      });
    }
  }
};

/**
 * Health check for Redis
 */
export const redisHealthCheck = async (): Promise<{
  status: "healthy" | "unhealthy";
  latency?: number;
  error?: string;
}> => {
  try {
    const client = getRedisClient();
    const start = Date.now();

    await client.ping();

    const latency = Date.now() - start;

    return {
      status: "healthy",
      latency,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

/**
 * Redis connection status
 */
export const getRedisStatus = (): {
  connected: boolean;
  status: string;
} => {
  if (!redisClient) {
    return {
      connected: false,
      status: "not_initialized",
    };
  }

  return {
    connected: redisClient.status === "ready",
    status: redisClient.status,
  };
};
