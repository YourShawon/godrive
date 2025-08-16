/**
 * Booking Validation Middleware
 *
 * Express middleware for validating booking requests
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../../../utils/logger/config.js";
import { createErrorResponse } from "../../../utils/responses.js";
import { createBookingSchema } from "../schemas/createBooking.schema.js";
import { getBookingParamsSchema } from "../schemas/getBooking.schema.js";
import { listBookingsQuerySchema } from "../schemas/listBookings.schema.js";

/**
 * Generic validation middleware factory for request body
 */
function createValidationMiddleware(
  schema: ZodSchema
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = `validation_${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      logger.info("🔍 Validation: Starting request validation", {
        traceId,
        endpoint: req.path,
        method: req.method,
      });

      // Validate request body
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const validationErrors = formatZodErrors(result.error);

        logger.warn("⚠️ Validation: Request validation failed", {
          traceId,
          errors: validationErrors,
          body: req.body,
        });

        res
          .status(400)
          .json(
            createErrorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              validationErrors,
              traceId
            )
          );
        return;
      }

      // Replace req.body with validated and transformed data
      req.body = result.data;

      logger.info("✅ Validation: Request validation successful", {
        traceId,
      });

      next();
    } catch (error) {
      logger.error("❌ Validation: Unexpected validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal validation error",
            "INTERNAL_SERVER_ERROR",
            undefined,
            traceId
          )
        );
      return;
    }
  };
}

/**
 * Generic validation middleware factory for URL parameters
 */
function createParamsValidationMiddleware(
  schema: ZodSchema
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = `params_validation_${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      logger.info("🔍 ParamsValidation: Starting parameter validation", {
        traceId,
        endpoint: req.path,
        method: req.method,
        params: req.params,
      });

      // Validate request params
      const result = schema.safeParse(req.params);

      if (!result.success) {
        const validationErrors = formatZodErrors(result.error);

        logger.warn("⚠️ ParamsValidation: Parameter validation failed", {
          traceId,
          errors: validationErrors,
          params: req.params,
        });

        res
          .status(400)
          .json(
            createErrorResponse(
              "Invalid parameters",
              "VALIDATION_ERROR",
              validationErrors,
              traceId
            )
          );
        return;
      }

      // Store validated data in a custom property instead of replacing req.params
      (req as any).validatedParams = result.data;

      logger.info("✅ ParamsValidation: Parameter validation successful", {
        traceId,
      });

      next();
    } catch (error) {
      logger.error("❌ ParamsValidation: Unexpected validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal parameter validation error",
            "INTERNAL_SERVER_ERROR",
            undefined,
            traceId
          )
        );
      return;
    }
  };
}

/**
 * Format Zod validation errors for API response
 */
function formatZodErrors(error: ZodError): Array<{
  field: string;
  message: string;
  code: string;
  received?: any;
}> {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
    received: "received" in err ? err.received : undefined,
  }));
}

/**
 * Generic validation middleware factory for query parameters
 */
function createQueryValidationMiddleware(
  schema: ZodSchema
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = `query_validation_${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      logger.info("🔍 QueryValidation: Starting query parameter validation", {
        traceId,
        endpoint: req.path,
        method: req.method,
        query: req.query,
      });

      // Validate request query
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const validationErrors = formatZodErrors(result.error);

        logger.warn("⚠️ QueryValidation: Query parameter validation failed", {
          traceId,
          errors: validationErrors,
          query: req.query,
        });

        res
          .status(400)
          .json(
            createErrorResponse(
              "Invalid query parameters",
              "VALIDATION_ERROR",
              validationErrors,
              traceId
            )
          );
        return;
      }

      // Store validated data in a custom property instead of replacing req.query
      (req as any).validatedQuery = result.data;

      logger.info("✅ QueryValidation: Query parameter validation successful", {
        traceId,
      });

      next();
    } catch (error) {
      logger.error("❌ QueryValidation: Unexpected validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal query validation error",
            "INTERNAL_SERVER_ERROR",
            undefined,
            traceId
          )
        );
      return;
    }
  };
}

/**
 * Validation middleware for create booking requests
 */
export const validateCreateBooking =
  createValidationMiddleware(createBookingSchema);

/**
 * Validation middleware for get booking parameters
 */
export const validateGetBookingParams = createParamsValidationMiddleware(
  getBookingParamsSchema
);

/**
 * Validation middleware for list bookings query parameters
 */
export const validateListBookingsQuery = createQueryValidationMiddleware(
  listBookingsQuerySchema
);

/**
 * Export the generic validation middleware factories for reuse
 */
export {
  createValidationMiddleware,
  createParamsValidationMiddleware,
  createQueryValidationMiddleware,
};
