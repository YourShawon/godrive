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

const logDebug = (entry: Omit<LogEntry, "level">) => {
  logger.debug(entry);
};

// 🏭 System-level loggers for infrastructure concerns
export const systemLogger = {
  database: {
    connected: (database: string) => {
      logInfo({
        traceId: "system",
        module: "system",
        action: "databaseConnection",
        message: `Connected to ${database}`,
        context: { database },
      });
    },

    error: (traceId: string, error: Error, operation?: string) => {
      logError({
        traceId,
        module: "system",
        action: "databaseOperation",
        message: `Database error: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { operation },
      });
    },
  },

  redis: {
    connected: () => {
      logInfo({
        traceId: "system",
        module: "system",
        action: "redisConnection",
        message: "Connected to Redis",
      });
    },

    error: (traceId: string, error: Error, operation?: string) => {
      logError({
        traceId,
        module: "system",
        action: "redisOperation",
        message: `Redis error: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { operation },
      });
    },
  },

  application: {
    started: (port: number) => {
      logInfo({
        traceId: "system",
        module: "system",
        action: "applicationStart",
        message: `Application started on port ${port}`,
        context: { port },
      });
    },

    shutdown: (signal: string) => {
      logInfo({
        traceId: "system",
        module: "system",
        action: "applicationShutdown",
        message: `Application shutting down: ${signal}`,
        context: { signal },
      });
    },
  },
};

// Export helper functions for other modules to use
export { logInfo, logError, logWarn, logDebug };
