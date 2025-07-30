import { Request, Response, NextFunction } from "express";
import { systemLogger } from "../utils/logger/index.js";

// 🛡️ Centralized Error Handler
// Handles all errors in a consistent format with proper logging

interface ErrorWithStatus extends Error {
  status?: number;
  code?: string;
  description?: string;
  hints?: string;
  traceId?: string;
}

export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const traceId = req.traceId || "unknown";

  // Default error values
  const status = error.status || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "An unexpected error occurred";

  // Log the error using our system logger
  systemLogger.application.errorOccurred(
    traceId,
    error,
    req.method,
    req.url,
    status
  );

  // Determine if we should expose error details
  const isProduction = process.env.NODE_ENV === "production";
  const shouldExposeDetails = !isProduction || status < 500;

  // Construct error response
  const errorResponse: any = {
    status,
    message: shouldExposeDetails ? message : "Internal server error",
    code,
    traceId,
    timestamp: new Date().toISOString(),
  };

  // Add additional details for non-production or client errors
  if (shouldExposeDetails) {
    if (error.description) {
      errorResponse.description = error.description;
    }
    if (error.hints) {
      errorResponse.hints = error.hints;
    }
    // Include stack trace only in development
    if (!isProduction && error.stack) {
      errorResponse.stack = error.stack;
    }
  }

  // Send error response
  res.status(status).json(errorResponse);
};

// 🎯 Middleware registration logger
export const logErrorHandlerRegistration = (): void => {
  systemLogger.application.middlewareRegistered(
    "errorHandler",
    "Centralized error handling enabled"
  );
};
