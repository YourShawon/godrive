/**
 * Logout Controller
 *
 * Simple function-based controller for user logout
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { getAuthService } from "../auth.container.js";
import { LogoutRequest } from "../interfaces/auth.service.interface.js";
import { AuthenticationError } from "../errors/AuthenticationError.js";
import { ValidationError } from "../errors/ValidationError.js";

/**
 * Handle user logout
 * POST /auth/logout
 */
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = `logout_${Date.now()}`;

  try {
    logger.info("🚀 Logout request started", {
      requestId,
      userId: req.body?.userId,
    });

    // Extract logout data from request
    const logoutData: LogoutRequest = {
      userId: req.body.userId,
      refreshToken: req.body.refreshToken,
      accessToken: req.body.accessToken || extractTokenFromHeader(req),
      logoutFromAllDevices: req.body.logoutFromAllDevices || false,
    };

    // Validate required fields
    if (!logoutData.userId) {
      throw new ValidationError("User ID is required");
    }

    // Get auth service and perform logout
    const authService = getAuthService();
    const result = await authService.logout(logoutData);

    logger.info("✅ Logout successful", {
      requestId,
      userId: logoutData.userId,
      logoutFromAllDevices: logoutData.logoutFromAllDevices,
    });

    // Send success response
    res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    logger.error("❌ Logout failed", {
      requestId,
      userId: req.body?.userId,
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

/**
 * Extract JWT token from Authorization header
 */
function extractTokenFromHeader(req: Request): string | undefined {
  const authHeader = req.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Remove "Bearer " prefix
  }
  return undefined;
}
