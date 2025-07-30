import express from "express";
import {
  correlationMiddleware,
  httpLogger,
  errorHandler,
} from "./middlewares/index.js";
import {
  initializeRedis,
  cacheUserById,
  invalidateUserCache,
  getCacheStats,
  redisHealthCheck,
} from "./utils/redis/index.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "./utils/responses.js";

const app = express();

// Apply middleware stack
app.use(express.json());
app.use(correlationMiddleware);
app.use(httpLogger);

// Mock user data for testing
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

// Mock database fetch function (simulates slow database query)
const fetchUserFromDatabase = async (userId: string) => {
  console.log(`📀 Simulating database fetch for user: ${userId}`);

  // Simulate database latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = mockUsers[userId];
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

// Test route: Get user with caching
app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  try {
    // Use cache-aside pattern
    const result = await cacheUserById(
      id,
      () => fetchUserFromDatabase(id),
      traceId
    );

    res.json(
      createSuccessResponse(
        "User retrieved successfully",
        {
          user: result.data,
          cacheInfo: {
            fromCache: result.fromCache,
            latency: result.latency,
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

// Test route: Invalidate user cache
app.delete("/users/:id/cache", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  try {
    const user = mockUsers[id];
    if (!user) {
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
      return;
    }

    await invalidateUserCache(id, user.email, traceId);

    res.json(
      createSuccessResponse(
        "User cache invalidated successfully",
        { userId: id },
        traceId
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createErrorResponse(
          "Failed to invalidate cache",
          "INTERNAL_ERROR",
          {},
          traceId
        )
      );
  }
});

// Cache statistics endpoint
app.get("/cache/stats", async (req, res) => {
  const traceId = req.traceId;

  try {
    const stats = await getCacheStats();
    const health = await redisHealthCheck();

    res.json(
      createSuccessResponse(
        "Cache statistics retrieved successfully",
        {
          stats,
          health,
        },
        traceId
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(
        createErrorResponse(
          "Failed to get cache statistics",
          "INTERNAL_ERROR",
          {},
          traceId
        )
      );
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const traceId = req.traceId;

  try {
    const redisHealth = await redisHealthCheck();

    res.json(
      createSuccessResponse(
        "Health check completed",
        {
          redis: redisHealth,
          timestamp: new Date().toISOString(),
        },
        traceId
      )
    );
  } catch (error) {
    res
      .status(503)
      .json(
        createErrorResponse(
          "Service unhealthy",
          "SERVICE_UNAVAILABLE",
          {},
          traceId
        )
      );
  }
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4001;

// Initialize Redis and start server
const startServer = async () => {
  try {
    console.log("🔄 Initializing Redis connection...");
    await initializeRedis();
    console.log("✅ Redis initialized successfully");

    app.listen(PORT, () => {
      console.log(`\n🎯 Redis Cache Test Server running on port ${PORT}`);
      console.log("\n📋 Test these endpoints:");
      console.log(
        `  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439011 (first call - database)`
      );
      console.log(
        `  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439011 (second call - cache)`
      );
      console.log(
        `  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439012`
      );
      console.log(
        `  DEL  http://localhost:${PORT}/users/507f1f77bcf86cd799439011/cache`
      );
      console.log(`  GET  http://localhost:${PORT}/cache/stats`);
      console.log(`  GET  http://localhost:${PORT}/health`);
      console.log("\n💡 Tips:");
      console.log(
        '  - First call to /users/:id will fetch from "database" (slow)'
      );
      console.log("  - Second call will be served from cache (fast)");
      console.log("  - Use DELETE /cache to invalidate and test cache refresh");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🔄 Shutting down gracefully...");
  const { closeRedis } = await import("./utils/redis/index.js");
  await closeRedis();
  process.exit(0);
});

startServer();
