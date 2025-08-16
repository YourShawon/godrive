/**
 * Query Validation Middleware
 *
 * Additional validation middleware for query parameters
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../../../utils/logger/config.js";
import { createErrorResponse } from "../../../utils/responses.js";
import { listBookingsQuerySchema } from "../schemas/listBookings.schema.js";

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
      logger.info("🔍 QueryValidation: Starting query validation", {
        traceId,
        endpoint: req.path,
        method: req.method,
        query: req.query,
      });

      // Validate request query
      const result = schema.safeParse(req.query);

      if (!result.success) {
        const validationErrors = formatZodErrors(result.error);

        logger.warn("⚠️ QueryValidation: Query validation failed", {
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

      // Store validated data in a custom property
      (req as any).validatedQuery = result.data;

      logger.info("✅ QueryValidation: Query validation successful", {
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
 * Validation middleware for list bookings query parameters
 */
export const validateListBookingsQuery = createQueryValidationMiddleware(
  listBookingsQuerySchema
);

/**
 * Export the generic validation middleware factory for reuse
 */
export { createQueryValidationMiddleware };
