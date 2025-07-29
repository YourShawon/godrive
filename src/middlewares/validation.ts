import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

// Validation middleware factory
export const validateRequest = (schema: {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters
      if (schema.query) {
        const validatedQuery = schema.query.parse(req.query);
        req.query = validatedQuery as any;
      }

      // Validate URL parameters
      if (schema.params) {
        const validatedParams = schema.params.parse(req.params);
        req.params = validatedParams as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err: ZodIssue) => ({
          field: err.path.join("."),
          message: err.message,
          code: err.code,
        }));

        res.status(400).json({
          status: "error",
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        status: "error",
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      });
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
