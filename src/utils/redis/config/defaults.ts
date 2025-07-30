/**
 * Cache Configuration
 * Default settings and constants for cache operations
 */

import { CacheOptions } from "../types/interfaces.js";

// Default cache options
export const DEFAULT_CACHE_OPTIONS: Required<CacheOptions> = {
  ttl: 3600, // 1 hour default
  prefix: "app",
  compress: false,
  serialize: true,
};

// Cache configuration constants
export const CACHE_CONSTANTS = {
  DEFAULT_TTL: 3600,
  MAX_KEY_LENGTH: 250,
  MAX_VALUE_SIZE: 512 * 1024 * 1024, // 512MB
  SERIALIZATION_PREVIEW_LENGTH: 100,
} as const;
