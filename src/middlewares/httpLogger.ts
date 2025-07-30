import morgan from "morgan";
import { Request, Response } from "express";
import { loggerStream, systemLogger } from "../utils/logger/index.js";

// 📊 HTTP Request Logger using Morgan + Winston integration

// Custom morgan tokens for structured logging
morgan.token("traceId", (req: Request) => req.traceId || "unknown");
morgan.token("userId", (req: Request) => (req as any).user?.id || "anonymous");

// 🎯 HTTP logging format for structured data
const httpLogFormat = (tokens: any, req: any, res: any) => {
  return JSON.stringify({
    traceId: tokens.traceId?.(req, res) || "unknown",
    module: "http",
    action: "request",
    message: "HTTP request processed",
    context: {
      method: tokens.method?.(req, res) || "UNKNOWN",
      url: tokens.url?.(req, res) || "unknown",
      status: parseInt(tokens.status?.(req, res) || "0", 10),
      responseTime: (tokens["response-time"]?.(req, res) || "0") + "ms",
      contentLength: tokens.res?.(req, res, "content-length") || "0",
      ipAddress: tokens["remote-addr"]?.(req, res) || "unknown",
      userAgent: tokens["user-agent"]?.(req, res) || "unknown",
      userId: tokens.userId?.(req, res) || "anonymous",
    },
  });
};

// 🚀 Morgan middleware with Winston integration
export const httpLogger = morgan(httpLogFormat as any, {
  stream: loggerStream,
  // Skip logging for health check endpoints in production
  skip: (req: Request) => {
    if (process.env.NODE_ENV === "production") {
      return req.url === "/health" || req.url === "/ping";
    }
    return false;
  },
});

// 🎯 Middleware registration logger
export const logHttpLoggerRegistration = (): void => {
  systemLogger.application.middlewareRegistered(
    "httpLogger",
    "HTTP request/response logging enabled"
  );
};
