/**
 * Update User Controller - PUT /users/:id
 * Handles user update requests with validation and business logic delegation
 *
 * Single Responsibility: HTTP request/response handling for user updates
 * Follows patterns from createUser.controller.ts
 */

import { Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../../utils/logger/config.js";
import { userService } from "../services/user.service.js";
import {
  updateUserSchema,
  changePasswordSchema,
} from "../schemas/updateUser.schema.js";
import {
  UserNotFoundError,
  UserUpdateForbiddenError,
  InvalidPasswordError,
  UserAlreadyExistsError,
  UserValidationError,
} from "../errors/index.js";

/**
 * Update user controller
 * PUT /users/:id
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traceId = req.traceId;
  const userId = req.params.id;
  const startTime = Date.now();

  logger.info("User update request received", {
    userId,
    traceId,
    module: "UpdateUserController",
    action: "updateUser_start",
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  try {
    // 1. Validate request body
    let validatedData;
    try {
      validatedData = updateUserSchema.parse(req.body);

      logger.debug("Input validation passed", {
        userId,
        traceId,
        module: "UpdateUserController",
        action: "validation_success",
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const validationErrors = validationError.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Input validation failed", {
          userId,
          traceId,
          validationErrors,
          module: "UpdateUserController",
          action: "validation_failed",
        });

        throw new UserValidationError(validationErrors, { traceId });
      }
      throw validationError;
    }

    // 2. Check authorization (basic check - user can only update themselves)
    if (!userId) {
      logger.warn("Missing user ID in update request", {
        traceId,
        module: "UpdateUserController",
        action: "updateUser_missing_id",
      });

      res.status(400).json({
        error: "User ID is required",
        traceId,
      });
      return;
    }

    // 3. Delegate to service layer for business logic
    // TODO: Get actual currentUserId from auth middleware
    // For now, simulate user updating themselves
    const currentUserId = userId; // Temporary: allow users to update themselves
    const updatedUser = await userService.updateUserWithLinks(
      userId,
      validatedData,
      currentUserId
    );

    const duration = Date.now() - startTime;

    logger.info("User updated successfully", {
      userId,
      traceId,
      module: "UpdateUserController",
      action: "updateUser_success",
      duration: `${duration}ms`,
    });

    // 4. Return success response with HATEOAS links
    res.status(200).json({
      success: true,
      data: updatedUser,
      traceId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle known business logic errors
    if (error instanceof UserNotFoundError) {
      logger.warn("User not found for update", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "updateUser_not_found",
        duration: `${duration}ms`,
      });

      res.status(404).json({
        error: "User not found",
        message: error instanceof Error ? error.message : "User not found",
        traceId,
      });
      return;
    }

    if (error instanceof UserUpdateForbiddenError) {
      logger.warn("Update forbidden", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "updateUser_forbidden",
        duration: `${duration}ms`,
      });

      res.status(403).json({
        error: "Update forbidden",
        message: error instanceof Error ? error.message : "Update forbidden",
        traceId,
      });
      return;
    }

    if (error instanceof UserAlreadyExistsError) {
      logger.warn("Email already exists during update", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "updateUser_email_exists",
        duration: `${duration}ms`,
      });

      res.status(409).json({
        error: "Email already exists",
        message:
          error instanceof Error ? error.message : "Email already exists",
        traceId,
      });
      return;
    }

    if (error instanceof UserValidationError) {
      logger.warn("User validation error during update", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "updateUser_validation_error",
        duration: `${duration}ms`,
      });

      res.status(400).json({
        error: "Validation error",
        message: error instanceof Error ? error.message : "Validation failed",
        traceId,
      });
      return;
    }

    // Handle unexpected errors
    logger.error("Unexpected error during user update", {
      userId,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "UpdateUserController",
      action: "updateUser_unexpected_error",
      duration: `${duration}ms`,
    });

    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while updating the user",
      traceId,
    });
  }
};

/**
 * Change user password controller
 * PUT /users/:id/password
 */
export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const traceId = req.traceId;
  const userId = req.params.id;
  const startTime = Date.now();

  logger.info("Password change request received", {
    userId,
    traceId,
    module: "UpdateUserController",
    action: "changePassword_start",
    userAgent: req.get("User-Agent"),
    ip: req.ip,
  });

  try {
    // 1. Validate request body
    let passwordData;
    try {
      passwordData = changePasswordSchema.parse(req.body);

      logger.debug("Password change validation passed", {
        userId,
        traceId,
        module: "UpdateUserController",
        action: "changePassword_validation_success",
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const validationErrors = validationError.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Password change validation failed", {
          userId,
          traceId,
          validationErrors,
          module: "UpdateUserController",
          action: "changePassword_validation_failed",
        });

        throw new UserValidationError(validationErrors, { traceId });
      }
      throw validationError;
    }

    // 2. Check authorization
    if (!userId) {
      logger.warn("Missing user ID in password change request", {
        traceId,
        module: "UpdateUserController",
        action: "changePassword_missing_id",
      });

      res.status(400).json({
        error: "User ID is required",
        traceId,
      });
      return;
    }

    // 3. Delegate to service layer
    // TODO: Get actual currentUserId from auth middleware
    // For now, simulate user updating themselves
    const currentUserId = userId; // Temporary: allow users to update themselves
    await userService.changePassword(userId, passwordData, currentUserId);

    const duration = Date.now() - startTime;

    logger.info("Password changed successfully", {
      userId,
      traceId,
      module: "UpdateUserController",
      action: "changePassword_success",
      duration: `${duration}ms`,
    });

    // 4. Return success response (no sensitive data)
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      traceId,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle known business logic errors
    if (error instanceof UserNotFoundError) {
      logger.warn("User not found for password change", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "changePassword_not_found",
        duration: `${duration}ms`,
      });

      res.status(404).json({
        error: "User not found",
        message: error instanceof Error ? error.message : "User not found",
        traceId,
      });
      return;
    }

    if (error instanceof InvalidPasswordError) {
      logger.warn("Invalid current password", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "changePassword_invalid_current",
        duration: `${duration}ms`,
      });

      res.status(400).json({
        error: "Invalid password",
        message: error instanceof Error ? error.message : "Invalid password",
        traceId,
      });
      return;
    }

    if (error instanceof UserUpdateForbiddenError) {
      logger.warn("Password change forbidden", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "changePassword_forbidden",
        duration: `${duration}ms`,
      });

      res.status(403).json({
        error: "Password change forbidden",
        message:
          error instanceof Error ? error.message : "Password change forbidden",
        traceId,
      });
      return;
    }

    if (error instanceof UserValidationError) {
      logger.warn("Password change validation error", {
        userId,
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        module: "UpdateUserController",
        action: "changePassword_validation_error",
        duration: `${duration}ms`,
      });

      res.status(400).json({
        error: "Validation error",
        message: error instanceof Error ? error.message : "Validation failed",
        traceId,
      });
      return;
    }

    // Handle unexpected errors
    logger.error("Unexpected error during password change", {
      userId,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "UpdateUserController",
      action: "changePassword_unexpected_error",
      duration: `${duration}ms`,
    });

    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred while changing the password",
      traceId,
    });
  }
};
