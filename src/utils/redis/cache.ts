/**
 * Enterprise Cache Utilities - Main Export
 * Simplified interface for all cache operations
 */

// Re-export types and interfaces
export * from "./types/interfaces.js";

// Re-export configuration
export { DEFAULT_CACHE_OPTIONS, CACHE_CONSTANTS } from "./config/defaults.js";

// Re-export utilities
export {
  generateCacheKey,
  serializeData,
  deserializeData,
} from "./utils/helpers.js";

// Re-export core operations
export {
  setCache,
  getCache,
  deleteCache,
  cacheExists,
} from "./operations/coreOperations.js";

// Re-export cache patterns
export {
  cacheAside,
  invalidateCachePattern,
} from "./patterns/cachePatterns.js";

// Re-export monitoring
export { getCacheStats, performHealthCheck } from "./monitoring/stats.js";
