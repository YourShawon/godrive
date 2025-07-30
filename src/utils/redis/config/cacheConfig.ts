import { CacheOptions } from "../cache.js";

/**
 * Cache Configuration Constants
 * Centralized cache TTL and configuration settings
 */

export const USER_CACHE_CONFIG: Required<CacheOptions> = {
  ttl: 1800, // 30 minutes for user data
  prefix: "user",
  compress: false,
  serialize: true,
};

export const USER_LIST_CACHE_CONFIG: Required<CacheOptions> = {
  ttl: 600, // 10 minutes for user lists (shorter because they change frequently)
  prefix: "user_list",
  compress: false,
  serialize: true,
};

export const USER_SESSION_CONFIG: Required<CacheOptions> = {
  ttl: 86400, // 24 hours for sessions
  prefix: "user_session",
  compress: false,
  serialize: true,
};
