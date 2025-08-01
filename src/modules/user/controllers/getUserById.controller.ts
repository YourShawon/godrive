/**
 * Get User By ID Controller
 * Handles HTTP request/response for retrieving a user by MongoDB ObjectId
 * Updated to use Service layer for business logic separation
 * Now supports HATEOAS via query parameter
 */

import { Request, Response } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { logger } from "../../../utils/logger/config.js";
import { userService } from "../services/user.service.js";
import { UserServiceError } from "../errors/user.service.errors.js";

/**
 * Get user by ID
 * @route GET /api/v1/users/:id?include=links
 * @desc Retrieves a user by their MongoDB ObjectId using service layer
 * @query include=links - Optional parameter to include HATEOAS links
 * @access Public (for now)
 */
export const getUserById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // Validation middleware ensures id exists and is valid MongoDB ObjectId
  const { id } = req.params as { id: string };
  const { include } = req.query as { include?: string };
  const traceId = req.traceId;
  const includeLinks = include === "links";

  logger.info("🔍 [getUserById] Starting request with service layer", {
    userId: id,
    includeLinks,
    traceId,
    module: "getUserById",
    action: "start",
  });

  try {
    // Step 1: Validation is already done by middleware
    // req.params.id is guaranteed to be a valid MongoDB ObjectId

    // Step 2: Service layer call (with or without HATEOAS)
    logger.debug("🏗️ [getUserById] Calling user service", {
      userId: id,
      includeLinks,
      traceId,
    });

    // Choose service method based on query parameter
    const result = includeLinks
      ? await userService.getUserByIdWithLinks(id)
      : await userService.getUserById(id);

    // Step 3: Handle not found case
    if (!result) {
      logger.info("❌ [getUserById] User not found (service response)", {
        userId: id,
        includeLinks,
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

    // Step 4: Success response (different format for HATEOAS)
    if (includeLinks) {
      // HATEOAS response - already contains proper structure
      const hateoasResult = result as any; // We know it's HATEOASResponse<SafeUser>

      logger.info(
        "✅ [getUserById] User with HATEOAS links retrieved successfully",
        {
          userId: id,
          userName: hateoasResult.data.name,
          userRole: hateoasResult.data.role,
          linksCount: Object.keys(hateoasResult._links).length,
          traceId,
          module: "getUserById",
          action: "hateoas_success",
          layer: "service",
        }
      );

      return res.json(
        createSuccessResponse(
          "User retrieved successfully with HATEOAS links",
          hateoasResult,
          traceId
        )
      );
    } else {
      // Standard response
      const user = result as any; // We know it's SafeUser

      logger.info(
        "✅ [getUserById] User retrieved successfully (service layer)",
        {
          userId: id,
          userName: user.name,
          userRole: user.role,
          traceId,
          module: "getUserById",
          action: "success",
          layer: "service",
        }
      );

      return res.json(
        createSuccessResponse(
          "User retrieved successfully",
          {
            user,
            meta: {
              processedBy: "service-layer",
              cached: "handled-by-service", // Redis caching integrated
              version: "1.0",
              hateoasAvailable: `Add ?include=links for hypermedia links`,
            },
          },
          traceId
        )
      );
    }
  } catch (error) {
    // Step 5: Enhanced error handling with service-aware logic
    if (error instanceof UserServiceError) {
      // Handle service errors with proper HTTP status codes
      logger.error("❌ [getUserById] Service error occurred", {
        userId: id,
        traceId,
        error: error.message,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        module: "getUserById",
        action: "service_error",
      });

      return res.status(error.statusCode).json(
        createErrorResponse(
          error.message,
          error.errorCode,
          {
            userId: id,
            details: error.details,
            layer: "service",
          },
          traceId
        )
      );
    }

    // Handle unexpected system errors
    logger.error("❌ [getUserById] System error occurred", {
      userId: id,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "getUserById",
      action: "system_error",
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json(
      createErrorResponse(
        "Failed to retrieve user",
        "INTERNAL_ERROR",
        {
          userId: id,
          details: errorMessage,
          layer: "controller",
        },
        traceId
      )
    );
  }
};
