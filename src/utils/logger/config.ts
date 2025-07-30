import winston, { format } from "winston";
import {
  redactSensitive,
  developmentFormatter,
  productionFormatter,
} from "./formatters.js";

// 🏗️ Winston Logger Configuration
export const logger = winston.createLogger({
  // Environment-aware log level
  level: process.env.NODE_ENV === "production" ? "info" : "debug",

  // Structured logging format
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
    redactSensitive(),
    format.errors({ stack: process.env.NODE_ENV !== "production" }),
    format.json()
  ),

  // Multiple transports for different environments
  transports: [
    // Console transport (with colors in development)
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? productionFormatter
          : developmentFormatter,
    }),

    // File transport with rotation
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Separate error log
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 🚀 Stream interface for Morgan HTTP logging
export const loggerStream = {
  write: (message: string) => {
    try {
      const parsed = JSON.parse(message.trim());
      logger.http(parsed);
    } catch (error) {
      // Fallback for non-JSON messages
      logger.http(message.trim());
    }
  },
};
