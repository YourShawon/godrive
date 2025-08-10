import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue, ZodSchema } from "zod";
import { logger } from "../utils/logger/config.js";
import { createErrorResponse } from "../utils/responses.js";

// Validation middleware factory
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const traceId = req.traceId;

    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
        logger.debug("Body validation successful", {
          traceId,
          bodyKeys: Object.keys(req.body || {}),
          module: "validation",
          action: "validateBody",
        });
      }

      // Validate query parameters
      if (schema.query) {
        const validatedQuery = schema.query.parse(req.query);
        req.query = validatedQuery as any;
        logger.debug("Query validation successful", {
          traceId,
          queryKeys: Object.keys(validatedQuery || {}),
          module: "validation",
          action: "validateQuery",
        });
      }

      // Validate URL parameters
      if (schema.params) {
        const validatedParams = schema.params.parse(req.params);
        req.params = validatedParams as any;
        logger.debug("Params validation successful", {
          traceId,
          paramKeys: Object.keys(validatedParams || {}),
          module: "validation",
          action: "validateParams",
        });
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        logger.warn("Validation failed", {
          traceId,
          errors,
          receivedBody: schema.body ? req.body : undefined,
          receivedQuery: schema.query ? req.query : undefined,
          receivedParams: schema.params ? req.params : undefined,
          module: "validation",
          action: "validationFailed",
        });

        res
          .status(400)
          .json(
            createErrorResponse(
              "Validation failed",
              "VALIDATION_ERROR",
              { errors },
              traceId
            )
          );
        return;
      }

      // Handle other errors
      logger.error("Unexpected validation error", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        module: "validation",
        action: "unexpectedError",
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            "Internal validation error",
            "INTERNAL_ERROR",
            {},
            traceId
          )
        );
    }
  };
};

// Utility function to validate data without middleware
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

// Safe validation that returns success/error result
export const safeValidateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
};

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
