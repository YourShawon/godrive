/**
 * Login Controller
 *
 * Simple function-based controller for user login
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { getAuthService } from "../auth.container.js";
import { LoginRequest } from "../interfaces/auth.service.interface.js";
import { AuthenticationError } from "../errors/AuthenticationError.js";
import { ValidationError } from "../errors/ValidationError.js";

/**
 * Handle user login
 * POST /auth/login
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = `login_${Date.now()}`;

  try {
    logger.info("🚀 Login request started", {
      requestId,
      email: req.body?.email,
    });

    // Extract login data from request
    const loginData: LoginRequest = {
      email: req.body.email,
      password: req.body.password,
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
    };

    // Get auth service and perform login
    const authService = getAuthService();
    const result = await authService.login(loginData);

    logger.info("✅ Login successful", {
      requestId,
      userId: result.user.id,
      email: result.user.email,
    });

    // Send success response
    res.status(200).json({
      success: result.success,
      message: result.message,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    logger.error("❌ Login failed", {
      requestId,
      email: req.body?.email,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        status: "error",
        message: error.message,
        errors: error.validationErrors,
        code: "VALIDATION_ERROR",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (error instanceof AuthenticationError) {
      res.status(401).json({
        status: "error",
        message: error.message,
        code: "AUTHENTICATION_ERROR",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
}
