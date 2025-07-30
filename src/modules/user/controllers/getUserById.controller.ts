/**
 * Get User By ID Controller
 * Handles HTTP request/response for retrieving a user by MongoDB ObjectId
 */

import { Request, Response } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { logger } from "../../../utils/logger/config.js";
import { userRepository } from "../repositories/user.repository.js";

/**
 * Get user by ID
 * @route GET /api/v1/users/:id
 * @desc Retrieves a user by their MongoDB ObjectId
 * @access Public (for now)
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Validation middleware ensures id exists and is valid MongoDB ObjectId
  const { id } = req.params as { id: string };
  const traceId = req.traceId;

  logger.info("🔍 [getUserById] Starting request", {
    userId: id,
    traceId,
    module: "getUserById",
    action: "start",
  });

  try {
    // Step 1: Validation is already done by middleware
    // req.params.id is guaranteed to be a valid MongoDB ObjectId

    // Step 2: Repository call
    logger.debug("🔍 [getUserById] Calling user repository", {
      userId: id,
      traceId,
    });

    const user = await userRepository.findById(id);

    // Step 3: Handle not found case
    if (!user) {
      logger.info("❌ [getUserById] User not found", {
        userId: id,
        traceId,
        module: "getUserById",
        action: "not_found",
      });

      return res
        .status(404)
        .json(
          createErrorResponse(
            "User not found",
            "NOT_FOUND",
            { userId: id },
            traceId
          )
        );
    }

    // Step 4: Success response
    logger.info("✅ [getUserById] User retrieved successfully", {
      userId: id,
      userName: user.name,
      userRole: user.role,
      traceId,
      module: "getUserById",
      action: "success",
    });

    return res.json(
      createSuccessResponse("User retrieved successfully", { user }, traceId)
    );
  } catch (error) {
    // Step 5: Error handling
    logger.error("❌ [getUserById] Error occurred", {
      userId: id,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "getUserById",
      action: "error",
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res
      .status(500)
      .json(
        createErrorResponse(
          "Failed to retrieve user",
          "INTERNAL_ERROR",
          { userId: id, details: errorMessage },
          traceId
        )
      );
  }
};
