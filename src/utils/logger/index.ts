// Export types
export type { LogContext, LogEntry, LoggerStream } from "./types.js";

// Export core logger and configuration
export { logger, loggerStream } from "./config.js";

// Export formatters for advanced usage
export {
  redactSensitive,
  developmentFormatter,
  productionFormatter,
} from "./formatters.js";

// Export module-specific loggers
export { userLogger } from "./modules/user.js";
export {
  systemLogger,
  logInfo,
  logError,
  logWarn,
  logDebug,
} from "./modules/system.js";

// Default export for convenience
export { logger as default } from "./config.js";
