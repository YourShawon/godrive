import express from "express";
import {
  correlationMiddleware,
  httpLogger,
  errorHandler,
} from "./middlewares/index.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "./utils/responses.js";

/**
 * Mock Redis Cache Test Server
 * Demonstrates caching patterns without requiring a Redis server
 * Shows the performance benefits and cache behavior
 */

const app = express();

// Apply middleware stack
app.use(express.json());
app.use(correlationMiddleware);
app.use(httpLogger);

// In-memory cache for demonstration (simulates Redis behavior)
const mockCache = new Map<string, { data: any; expiry: number }>();

// Mock user data
const mockUsers: { [key: string]: any } = {
  "507f1f77bcf86cd799439011": {
    id: "507f1f77bcf86cd799439011",
    email: "john@example.com",
    firstName: "John",
    lastName: "Doe",
    role: "user",
    isActive: true,
    createdAt: "2025-01-15T10:30:00.000Z",
  },
  "507f1f77bcf86cd799439012": {
    id: "507f1f77bcf86cd799439012",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    role: "admin",
    isActive: true,
    createdAt: "2025-01-20T14:20:00.000Z",
  },
};

// Mock cache operations
const mockCacheOperations = {
  set: (key: string, value: any, ttlSeconds: number = 1800) => {
    const expiry = Date.now() + ttlSeconds * 1000;
    mockCache.set(key, { data: value, expiry });
    console.log(`📦 CACHE SET: ${key} (TTL: ${ttlSeconds}s)`);
  },

  get: (key: string) => {
    const entry = mockCache.get(key);
    if (!entry) {
      console.log(`❌ CACHE MISS: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiry) {
      mockCache.delete(key);
      console.log(`⏰ CACHE EXPIRED: ${key}`);
      return null;
    }

    console.log(`✅ CACHE HIT: ${key}`);
    return entry.data;
  },

  delete: (key: string) => {
    const deleted = mockCache.delete(key);
    console.log(`🗑️ CACHE DELETE: ${key} (existed: ${deleted})`);
    return deleted;
  },

  clear: () => {
    const size = mockCache.size;
    mockCache.clear();
    console.log(`🧹 CACHE CLEAR: ${size} keys deleted`);
  },

  stats: () => {
    const now = Date.now();
    const validKeys = Array.from(mockCache.entries()).filter(
      ([_, entry]) => now <= entry.expiry
    );
    return {
      totalKeys: mockCache.size,
      validKeys: validKeys.length,
      expiredKeys: mockCache.size - validKeys.length,
    };
  },
};

// Mock database fetch with simulated latency
const fetchUserFromDatabase = async (userId: string): Promise<any> => {
  const startTime = Date.now();
  console.log(`🔍 DATABASE QUERY: Fetching user ${userId}...`);

  // Simulate database latency (300-500ms)
  const latency = 300 + Math.random() * 200;
  await new Promise((resolve) => setTimeout(resolve, latency));

  const user = mockUsers[userId];
  if (!user) {
    throw new Error("User not found");
  }

  const endTime = Date.now();
  console.log(
    `📀 DATABASE RESULT: User ${userId} fetched in ${endTime - startTime}ms`
  );

  return user;
};

// Cache-aside pattern implementation
const getUserWithCache = async (userId: string, traceId?: string) => {
  const startTime = Date.now();
  const cacheKey = `user:id:${userId}`;

  // Try cache first
  let cachedUser = mockCacheOperations.get(cacheKey);
  if (cachedUser) {
    const endTime = Date.now();
    return {
      user: cachedUser,
      fromCache: true,
      latency: endTime - startTime,
      source: "cache",
    };
  }

  // Cache miss - fetch from database
  try {
    const user = await fetchUserFromDatabase(userId);

    // Cache the result
    mockCacheOperations.set(cacheKey, user, 1800); // 30 min TTL

    const endTime = Date.now();
    return {
      user,
      fromCache: false,
      latency: endTime - startTime,
      source: "database",
    };
  } catch (error) {
    throw error;
  }
};

// Routes
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  try {
    const result = await getUserWithCache(id, traceId);

    res.json(
      createSuccessResponse(
        "User retrieved successfully",
        {
          user: result.user,
          cacheInfo: {
            fromCache: result.fromCache,
            latency: result.latency,
            source: result.source,
          },
        },
        traceId
      )
    );
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      res
        .status(404)
        .json(
          createErrorResponse(
            "User not found",
            "NOT_FOUND",
            { userId: id },
            traceId
          )
        );
    } else {
      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal server error",
            "INTERNAL_ERROR",
            {},
            traceId
          )
        );
    }
  }
});

// Invalidate specific user cache
app.delete("/users/:id/cache", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  const cacheKey = `user:id:${id}`;
  const deleted = mockCacheOperations.delete(cacheKey);

  res.json(
    createSuccessResponse(
      "User cache invalidated",
      {
        userId: id,
        cacheKey,
        wasInCache: deleted,
      },
      traceId
    )
  );
});

// Cache statistics
app.get("/cache/stats", async (req, res) => {
  const traceId = req.traceId;
  const stats = mockCacheOperations.stats();

  res.json(
    createSuccessResponse(
      "Cache statistics retrieved",
      {
        cache: {
          type: "mock-memory",
          ...stats,
        },
        allKeys: Array.from(mockCache.keys()),
      },
      traceId
    )
  );
});

// Clear all cache
app.delete("/cache", async (req, res) => {
  const traceId = req.traceId;

  mockCacheOperations.clear();

  res.json(createSuccessResponse("Cache cleared successfully", {}, traceId));
});

// Performance comparison endpoint
app.get("/performance-test/:id", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  try {
    // Test 1: Cache miss (database fetch)
    const cacheKey = `user:id:${id}`;
    mockCacheOperations.delete(cacheKey); // Ensure cache miss

    const uncachedResult = await getUserWithCache(id, traceId);

    // Test 2: Cache hit (immediate return)
    const cachedResult = await getUserWithCache(id, traceId);

    // Test 3: Multiple cache hits
    const multipleHits = [];
    for (let i = 0; i < 5; i++) {
      const result = await getUserWithCache(id, traceId);
      multipleHits.push({
        attempt: i + 1,
        latency: result.latency,
        fromCache: result.fromCache,
      });
    }

    res.json(
      createSuccessResponse(
        "Performance test completed",
        {
          uncachedFetch: {
            latency: uncachedResult.latency,
            source: uncachedResult.source,
          },
          cachedFetch: {
            latency: cachedResult.latency,
            source: cachedResult.source,
          },
          performanceGain: `${Math.round((uncachedResult.latency / cachedResult.latency) * 100) / 100}x faster`,
          multipleHits,
          summary: {
            avgCacheLatency: Math.round(
              multipleHits.reduce((sum, hit) => sum + hit.latency, 0) /
                multipleHits.length
            ),
            databaseLatency: uncachedResult.latency,
            speedImprovement: `~${Math.round((uncachedResult.latency / (multipleHits.reduce((sum, hit) => sum + hit.latency, 0) / multipleHits.length)) * 100) / 100}x`,
          },
        },
        traceId
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createErrorResponse(
          "Performance test failed",
          "INTERNAL_ERROR",
          {},
          traceId
        )
      );
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`\n🎯 Mock Redis Cache Test Server running on port ${PORT}`);
  console.log("\n📋 Test these endpoints:");
  console.log(`\n🔍 Basic Cache Testing:`);
  console.log(
    `  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439011 (first = database, second = cache)`
  );
  console.log(`  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439012`);
  console.log(`\n🗑️ Cache Management:`);
  console.log(
    `  DEL  http://localhost:${PORT}/users/507f1f77bcf86cd799439011/cache (invalidate specific user)`
  );
  console.log(`  DEL  http://localhost:${PORT}/cache (clear all cache)`);
  console.log(`\n📊 Monitoring:`);
  console.log(`  GET  http://localhost:${PORT}/cache/stats (cache statistics)`);
  console.log(
    `  GET  http://localhost:${PORT}/performance-test/507f1f77bcf86cd799439011 (performance comparison)`
  );
  console.log(`\n💡 What to observe:`);
  console.log(`  📀 First request: ~300-500ms (database fetch)`);
  console.log(`  ⚡ Cached request: ~1-5ms (memory fetch)`);
  console.log(`  🚀 Performance gain: ~100-500x faster!`);
  console.log(`\n🐳 To use real Redis:`);
  console.log(`  docker-compose -f docker-compose.redis.yml up -d`);
  console.log(`  npm run test:redis`);
});
