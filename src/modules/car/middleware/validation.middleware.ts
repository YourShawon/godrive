/**
 * Car Validation Middleware
 *
 * Provides request validation using Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../../../utils/logger/config.js";

/**
 * Validate request parameters using Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = `validation_${Date.now()}`;

    try {
      // Validate request parameters
      const validatedParams = schema.parse(req.params);

      // Replace req.params with validated data (type assertion needed for Express types)
      req.params = validatedParams as any;

      logger.info("✅ Parameter validation successful", {
        requestId,
        endpoint: req.route?.path,
        method: req.method,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("⚠️ Parameter validation failed", {
          requestId,
          endpoint: req.route?.path,
          method: req.method,
          errors: error.issues,
        });

        res.status(400).json({
          success: false,
          message: "Invalid request parameters",
          error: {
            code: "VALIDATION_ERROR",
            description: "The provided parameters are invalid",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
              received: err.input,
            })),
          },
          requestId,
        });
        return;
      }

      logger.error("❌ Unexpected validation error", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      next(error);
    }
  };
}
