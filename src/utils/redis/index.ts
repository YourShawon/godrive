/**
 * Redis Infrastructure - Main Export
 * Provides Redis caching infrastructure
 */

// Client management
export {
  createRedisClient,
  getRedisClient,
  initializeRedis,
  closeRedis,
  redisHealthCheck,
  getRedisStatus,
  type RedisConfig,
} from "./client.js";

// Core cache operations
export {
  setCache,
  getCache,
  deleteCache,
  cacheExists,
  cacheAside,
  invalidateCachePattern,
  getCacheStats,
  generateCacheKey,
  type CacheResult,
  type CacheOptions,
} from "./cache.js";

// User-specific cache patterns
export {
  cacheUserById,
  cacheUserByEmail,
  cacheUserList,
  invalidateUserCache,
  warmUserCache,
  getCachedUser,
  cacheUserSession,
  getCachedUserSession,
  UserCacheKeys,
} from "./userCache.js";
