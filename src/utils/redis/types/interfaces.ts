/**
 * Cache Types and Interfaces
 * Centralized type definitions for cache operations
 */

// Cache operation result interface
export interface CacheResult<T> {
  success: boolean;
  data?: T;
  fromCache?: boolean;
  error?: string;
  latency?: number;
}

// Cache configuration options
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for namespacing
  compress?: boolean; // Whether to compress large values
  serialize?: boolean; // Whether to JSON serialize
}

// Cache statistics interface
export interface CacheStats {
  connected: boolean;
  memory: string;
  keyCount: number;
  hitRate?: number;
}
