/**
 * Create User Controller
 * Handles HTTP request/response for creating a new user
 * Follows established service layer pattern with comprehensive error handling
 * Supports HATEOAS via query parameter
 */

import { Request, Response } from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { logger } from "../../../utils/logger/config.js";
import { userService } from "../services/user.service.js";
import {
  UserAlreadyExistsError,
  InvalidUserDataError,
  UserValidationError,
  UserOperationFailedError,
  ServiceError,
} from "../errors/index.js";
import {
  createUserSchema,
  CreateUserInput,
} from "../schemas/createUser.schema.js";
import { ZodError } from "zod";

/**
 * Create new user
 * @route POST /api/v1/users?include=links
 * @desc Creates a new user using service layer with comprehensive validation
 * @query include=links - Optional parameter to include HATEOAS links in response
 * @access Public (for now)
 */
export const createUser = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { include } = req.query as { include?: string };
  const traceId = req.traceId;
  const includeLinks = include === "links";

  logger.info("🚀 [createUser] Starting request with service layer", {
    hasEmail: !!req.body?.email,
    bodyKeys: Object.keys(req.body || {}),
    includeLinks,
    traceId,
    module: "createUser",
    action: "start",
  });

  try {
    // Step 1: Input validation with Zod schema
    logger.debug("🔍 [createUser] Validating input data", {
      traceId,
      module: "createUser",
      action: "validation_start",
    });

    let validatedData: CreateUserInput;
    try {
      validatedData = createUserSchema.parse(req.body);

      logger.debug("✅ [createUser] Input validation passed", {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role,
        traceId,
        module: "createUser",
        action: "validation_success",
      });
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const validationErrors = validationError.issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("❌ [createUser] Input validation failed", {
          validationErrors,
          traceId,
          module: "createUser",
          action: "validation_failed",
        });

        // Throw our custom validation error
        throw new UserValidationError(validationErrors, { traceId });
      }
      throw validationError; // Re-throw non-Zod errors
    }

    // Step 2: Service layer call (with or without HATEOAS)
    logger.debug("🏗️ [createUser] Calling user service", {
      email: validatedData.email,
      name: validatedData.name,
      includeLinks,
      traceId,
      module: "createUser",
      action: "service_call",
    });

    // Choose service method based on query parameter
    const result = includeLinks
      ? await userService.createUserWithLinks(validatedData)
      : await userService.createUser(validatedData);

    // Step 3: Success response (different format for HATEOAS)
    if (includeLinks) {
      // HATEOAS response - already contains proper structure
      const hateoasResult = result as any; // We know it's HATEOASResponse<SafeUser>

      logger.info(
        "✅ [createUser] User with HATEOAS links created successfully",
        {
          userId: hateoasResult.data.id,
          email: hateoasResult.data.email,
          userName: hateoasResult.data.name,
          userRole: hateoasResult.data.role,
          linksCount: Object.keys(hateoasResult._links).length,
          traceId,
          module: "createUser",
          action: "hateoas_success",
          layer: "service",
        }
      );

      return res
        .status(201)
        .json(
          createSuccessResponse(
            "User created successfully with HATEOAS links",
            hateoasResult,
            traceId
          )
        );
    } else {
      // Standard response
      const user = result as any; // We know it's SafeUser

      logger.info("✅ [createUser] User created successfully (service layer)", {
        userId: user.id,
        email: user.email,
        userName: user.name,
        userRole: user.role,
        traceId,
        module: "createUser",
        action: "success",
        layer: "service",
      });

      return res.status(201).json(
        createSuccessResponse(
          "User created successfully",
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
    // Step 4: Enhanced error handling with service-aware logic
    if (error instanceof ServiceError) {
      // Handle all our custom service errors with proper HTTP status codes
      logger.error("❌ [createUser] Service error occurred", {
        email: req.body?.email,
        traceId,
        error: error.message,
        errorCode: error.errorCode,
        statusCode: error.statusCode,
        module: "createUser",
        action: "service_error",
      });

      return res.status(error.statusCode).json(
        createErrorResponse(
          error.message,
          error.errorCode,
          {
            details: error.details,
            layer: "service",
          },
          traceId
        )
      );
    }

    // Handle unexpected system errors
    logger.error("❌ [createUser] System error occurred", {
      email: req.body?.email,
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      module: "createUser",
      action: "system_error",
    });

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json(
      createErrorResponse(
        "Failed to create user",
        "INTERNAL_ERROR",
        {
          details: errorMessage,
          layer: "controller",
        },
        traceId
      )
    );
  }
};
