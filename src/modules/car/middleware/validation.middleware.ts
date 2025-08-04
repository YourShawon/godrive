/**
 * Car Validation Middleware
 *
 * Provides request validation using Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../../../utils/logger/config.js";
import { createErrorResponse } from "../../../utils/responses.js";

/**
 * Validate request parameters using Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = req.traceId || `validation_${Date.now()}`;

    try {
      // Validate request parameters
      const validatedParams = schema.parse(req.params);

      // Replace req.params with validated data (type assertion needed for Express types)
      req.params = validatedParams as any;

      logger.info("✅ Parameter validation successful", {
        traceId,
        endpoint: req.route?.path,
        method: req.method,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("⚠️ Parameter validation failed", {
          traceId,
          endpoint: req.route?.path,
          method: req.method,
          errors: error.issues,
        });

        res.status(400).json(
          createErrorResponse(
            "Invalid request parameters",
            "VALIDATION_ERROR",
            {
              validationErrors: error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                received: err.input,
              })),
            },
            traceId
          )
        );
        return;
      }

      logger.error("❌ Unexpected validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      next(error);
    }
  };
}

/**
 * Validate request query parameters using Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = req.traceId || `validation_${Date.now()}`;

    try {
      // Validate request query parameters
      const validatedQuery = schema.parse(req.query);

      // Replace req.query with validated data (type assertion needed for Express types)
      req.query = validatedQuery as any;

      logger.info("✅ Query validation successful", {
        traceId,
        endpoint: req.route?.path,
        method: req.method,
        queryKeys: Object.keys(validatedQuery as object),
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("⚠️ Query validation failed", {
          traceId,
          endpoint: req.route?.path,
          method: req.method,
          errors: error.issues,
        });

        res.status(400).json(
          createErrorResponse(
            "Invalid query parameters",
            "QUERY_VALIDATION_ERROR",
            {
              validationErrors: error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                received: err.input,
              })),
            },
            traceId
          )
        );
        return;
      }

      logger.error("❌ Unexpected query validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      next(error);
    }
  };
}

/**
 * Validate request body using Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = req.traceId || `validation_${Date.now()}`;

    try {
      // Validate request body
      const validatedBody = schema.parse(req.body);

      // Replace req.body with validated data
      req.body = validatedBody;

      logger.info("✅ Body validation successful", {
        traceId,
        endpoint: req.route?.path,
        method: req.method,
        bodyKeys: Object.keys(validatedBody as object),
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn("⚠️ Body validation failed", {
          traceId,
          endpoint: req.route?.path,
          method: req.method,
          errors: error.issues,
        });

        res.status(400).json(
          createErrorResponse(
            "Invalid request body",
            "BODY_VALIDATION_ERROR",
            {
              validationErrors: error.issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                received: err.input,
              })),
            },
            traceId
          )
        );
        return;
      }

      logger.error("❌ Unexpected body validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      next(error);
    }
  };
}
