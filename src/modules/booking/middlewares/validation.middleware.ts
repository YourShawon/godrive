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

/**
 * Generic validation middleware factory
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
 * Validation middleware for create booking requests
 */
export const validateCreateBooking =
  createValidationMiddleware(createBookingSchema);

/**
 * Export the generic validation middleware factory for reuse
 */
export { createValidationMiddleware };
