import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { systemLogger } from "../utils/logger/index.js";

// 🔗 Correlation ID Middleware
// Generates unique traceId for each request to enable request tracing across the system

export const correlationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Generate unique trace ID for this request
    const traceId = uuidv4();

    // Attach to request object for controllers and other middleware
    req.traceId = traceId;

    // Add to response headers for client debugging and external correlation
    res.setHeader("X-Trace-Id", traceId);

    // Log the request initiation (debug level to avoid noise)
    if (process.env.NODE_ENV !== "production") {
      systemLogger.application.requestStarted(traceId, req.method, req.url);
    }

    next();
  } catch (error) {
    // Fallback: generate simple traceId and continue
    const fallbackTraceId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    req.traceId = fallbackTraceId;
    res.setHeader("X-Trace-Id", fallbackTraceId);

    // Log the error but don't break the request
    systemLogger.application.middlewareError(
      "correlation",
      error as Error,
      fallbackTraceId
    );

    next();
  }
};

// 🎯 Middleware registration logger
export const logCorrelationMiddlewareRegistration = (): void => {
  systemLogger.application.middlewareRegistered(
    "correlation",
    "Request tracing enabled"
  );
};
