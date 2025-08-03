/**
 * Auth Routes
 *
 * Express routes for all authentication endpoints.
 * These routes use the main AuthService for all operations.
 */

import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { getAuthService } from "./auth.container.js";
import { logger } from "@utils/logger/config.js";
import { AuthenticationError } from "./errors/AuthenticationError.js";
import { ValidationError } from "./errors/ValidationError.js";

const router = Router();
const authService = getAuthService();

// ==================== AUTH ENDPOINTS ====================

/**
 * POST /auth/register
 * Register a new user
 */
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registerData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        deviceInfo: req.get("X-Device-Info") || "Unknown Device",
      };

      const result = await authService.register(registerData);

      logger.info("✅ User registration successful", {
        userId: result.user.id,
        email: result.user.email,
        endpoint: "POST /auth/register",
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/login
 * Login user
 */
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = {
        ...req.body,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get("User-Agent"),
        deviceInfo: req.get("X-Device-Info") || "Unknown Device",
      };

      const result = await authService.login(loginData);

      logger.info("✅ User login successful", {
        userId: result.user.id,
        email: result.user.email,
        endpoint: "POST /auth/login",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshData = {
        refreshToken: req.body.refreshToken,
        ipAddress: req.ip || req.connection.remoteAddress || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
        deviceInfo: req.get("X-Device-Info") || "Unknown Device",
      };
      const result = await authService.refreshToken(refreshData);

      logger.info("✅ Token refresh successful", {
        endpoint: "POST /auth/refresh",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/logout
 * Logout user
 */
router.post(
  "/logout",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user ID from authenticated request (set by auth middleware)
      const userId = (req as any).user?.userId;

      const authHeader = req.get("Authorization");
      const accessToken = authHeader?.replace("Bearer ", "");

      const logoutData: any = {
        userId,
        refreshToken: req.body.refreshToken,
        accessToken: accessToken || undefined,
        logoutFromAllDevices: req.body.logoutFromAllDevices || false,
      };
      const result = await authService.logout(logoutData);

      logger.info("✅ User logout successful", {
        userId,
        logoutFromAllDevices: logoutData.logoutFromAllDevices,
        endpoint: "POST /auth/logout",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/change-password
 * Change user password
 */
router.post(
  "/change-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract user ID from authenticated request (set by auth middleware)
      const userId = (req as any).user?.userId;

      const changePasswordData = {
        userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      };

      const result = await authService.changePassword(changePasswordData);

      logger.info("✅ Password change successful", {
        userId,
        endpoint: "POST /auth/change-password",
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /auth/me
 * Get current user info (requires authentication)
 */
router.get("/me", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // User info is set by auth middleware
    const userInfo = (req as any).user;

    if (!userInfo) {
      throw new AuthenticationError("User not authenticated");
    }

    logger.debug("✅ User info retrieved", {
      userId: userInfo.userId,
      endpoint: "GET /auth/me",
    });

    res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /auth/validate-token
 * Validate access token (utility endpoint)
 */
router.post(
  "/validate-token",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          message: "Token is required",
        });
        return;
      }

      const tokenPayload = await authService.validateToken(token);

      if (!tokenPayload) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
        return;
      }

      res.status(200).json({
        success: true,
        valid: true,
        payload: tokenPayload,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==================== ERROR HANDLING ====================

/**
 * Auth-specific error handler
 */
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error("❌ Auth route error", {
    error: error.message,
    stack: error.stack,
    endpoint: `${req.method} ${req.path}`,
    body: req.body,
  });

  if (error instanceof AuthenticationError) {
    res.status(401).json({
      success: false,
      message: error.message,
      code: "AUTHENTICATION_ERROR",
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      success: false,
      message: error.message,
      errors: (error as ValidationError).validationErrors,
      code: "VALIDATION_ERROR",
    });
    return;
  }

  // Pass to global error handler
  next(error);
});

export const authRoutes = router;
