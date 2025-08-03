/**
 * Register Controller
 *
 * Simple function-based controller for user registration
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { getAuthService } from "../auth.container.js";
import { RegisterRequest } from "../interfaces/auth.service.interface.js";
import { AuthenticationError } from "../errors/AuthenticationError.js";
import { ValidationError } from "../errors/ValidationError.js";

/**
 * Handle user registration
 * POST /auth/register
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = `register_${Date.now()}`;

  try {
    logger.info("🚀 Registration request started", {
      email: req.body?.email,
      requestId,
    });

    // Prepare registration data
    const registerData: RegisterRequest = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
      ipAddress: req.ip || req.connection.remoteAddress || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
      deviceInfo: req.get("X-Device-Info") || "Unknown Device",
    };

    // Call auth service
    const authService = getAuthService();
    const result = await authService.register(registerData);

    logger.info("✅ Registration successful", {
      userId: result.user.id,
      email: result.user.email,
      requestId,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  } catch (error) {
    logger.error("❌ Registration failed", {
      email: req.body?.email,
      error: error instanceof Error ? error.message : "Unknown error",
      requestId,
    });

    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        errors: error.validationErrors,
        code: "VALIDATION_ERROR",
      });
      return;
    }

    if (error instanceof AuthenticationError) {
      res.status(400).json({
        success: false,
        message: error.message,
        code: "AUTHENTICATION_ERROR",
      });
      return;
    }

    next(error);
  }
}
