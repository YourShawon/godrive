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

    requestStarted: (traceId: string, method: string, url: string) => {
      logDebug({
        traceId,
        module: "system",
        action: "requestStart",
        message: `${method} ${url}`,
        context: { method, url },
      });
    },

    middlewareRegistered: (middleware: string, description: string) => {
      logInfo({
        traceId: "system",
        module: "system",
        action: "middlewareRegistration",
        message: `Middleware registered: ${middleware}`,
        context: { middleware, description },
      });
    },

    middlewareError: (middleware: string, error: Error, traceId: string) => {
      logError({
        traceId,
        module: "system",
        action: "middlewareError",
        message: `Middleware error in ${middleware}: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { middleware },
      });
    },

    errorOccurred: (
      traceId: string,
      error: Error,
      method: string,
      url: string,
      status: number
    ) => {
      logError({
        traceId,
        module: "system",
        action: "errorHandler",
        message: `${status} error: ${error.message}`,
        error: { name: error.name, message: error.message },
        context: { method, url, status },
      });
    },
  },
};

// Export helper functions for other modules to use
export { logInfo, logError, logWarn, logDebug };
