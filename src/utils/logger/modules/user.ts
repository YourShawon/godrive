import { LogEntry } from "../types.js";
import { logger } from "../config.js";

// 🎯 Helper functions for structured logging
const logInfo = (entry: Omit<LogEntry, "level">) => {
  logger.info(entry);
};

const logError = (entry: Omit<LogEntry, "level">) => {
  logger.error(entry);
};

const logWarn = (entry: Omit<LogEntry, "level">) => {
  logger.warn(entry);
};

// 🎯 User Module Specific Loggers - Following the user's comprehensive plan
export const userLogger = {
  createUser: {
    success: (traceId: string, userId: string, role: string) => {
      logInfo({
        traceId,
        module: "user",
        action: "createUser",
        message: "User created successfully",
        context: { userId, role },
      });
    },

    validationError: (traceId: string, errors: any[], email?: string) => {
      logError({
        traceId,
        module: "user",
        action: "createUser",
        message: "Validation error",
        context: { errors, ...(email && { email }) },
      });
    },

    duplicateEmail: (traceId: string, email: string) => {
      logError({
        traceId,
        module: "user",
        action: "createUser",
        message: "Email already exists",
        context: { email },
      });
    },

    databaseError: (traceId: string, error: Error, email?: string) => {
      logError({
        traceId,
        module: "user",
        action: "createUser",
        message: `Database error: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { ...(email && { email }) },
      });
    },
  },

  getUser: {
    success: (
      traceId: string,
      userId: string,
      requesterId: string,
      requesterRole: string
    ) => {
      logInfo({
        traceId,
        module: "user",
        action: "getUser",
        message: "User retrieved successfully",
        context: { userId, requesterId, requesterRole },
      });
    },

    notFound: (traceId: string, userId: string, requesterId: string) => {
      logError({
        traceId,
        module: "user",
        action: "getUser",
        message: "User not found",
        error: {
          name: "NotFoundError",
          message: "The user with the specified ID does not exist",
        },
        context: { userId, requesterId },
      });
    },

    unauthorized: (traceId: string, userId: string, requesterId: string) => {
      logError({
        traceId,
        module: "user",
        action: "getUser",
        message: "Unauthorized access attempt",
        error: { name: "UnauthorizedError", message: "Access denied" },
        context: { userId, requesterId },
      });
    },

    cacheHit: (traceId: string, cacheKey: string, userId: string) => {
      logInfo({
        traceId,
        module: "user",
        action: "getUser",
        message: "Cache hit for user profile",
        context: { cacheKey, userId },
      });
    },

    cacheMiss: (traceId: string, cacheKey: string) => {
      logWarn({
        traceId,
        module: "user",
        action: "getUser",
        message: "Cache miss, fetching from database",
        context: { cacheKey },
      });
    },
  },

  updateUser: {
    success: (
      traceId: string,
      userId: string,
      updatedFields: string[],
      requesterRole: string
    ) => {
      logInfo({
        traceId,
        module: "user",
        action: "updateUser",
        message: "User updated successfully",
        context: { userId, updatedFields, requesterRole },
      });
    },

    noChanges: (traceId: string, userId: string) => {
      logWarn({
        traceId,
        module: "user",
        action: "updateUser",
        message: "No changes applied",
        context: { userId },
      });
    },

    cacheInvalidated: (
      traceId: string,
      userId: string,
      cacheKeys: string[]
    ) => {
      logInfo({
        traceId,
        module: "user",
        action: "updateUser",
        message: "Cache invalidated for user profile and list",
        context: { userId, cacheKeys },
      });
    },
  },

  // System-level logging
  system: {
    redisError: (traceId: string, error: Error, operation?: string) => {
      logError({
        traceId,
        module: "user",
        action: "redisOperation",
        message: `Redis error: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { operation },
      });
    },

    redisConnected: () => {
      logInfo({
        traceId: "system",
        module: "user",
        action: "redisConnection",
        message: "Connected to Redis",
      });
    },
  },
};
