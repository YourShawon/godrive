/**
 * Get Review Validation Schemas
 *
 * Zod schemas for validating get review requests
 */

import { z } from "zod";

/**
 * MongoDB ObjectId validation pattern
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

/**
 * Schema for validating review ID parameter
 */
export const getReviewParamsSchema = z.object({
  id: objectIdSchema.describe("Review ID to retrieve"),
});

/**
 * Schema for validating query parameters
 */
export const getReviewQuerySchema = z.object({
  include: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const includes = val.split(",").map((s) => s.trim());
        return includes.every((inc) => ["car", "user"].includes(inc));
      },
      {
        message:
          "Include parameter can only contain 'car' and/or 'user' separated by commas",
      }
    )
    .describe("Include related data: 'car', 'user', or 'car,user'"),
});

/**
 * Type inference for get review parameters
 */
export type GetReviewParams = z.infer<typeof getReviewParamsSchema>;

/**
 * Type inference for get review query
 */
export type GetReviewQuery = z.infer<typeof getReviewQuerySchema>;

/**
 * Complete request validation schema
 */
export const getReviewRequestSchema = z.object({
  params: getReviewParamsSchema,
  query: getReviewQuerySchema,
});

/**
 * Example valid requests for documentation
 */
export const getReviewExamples = {
  basic: {
    params: { id: "507f1f77bcf86cd799439011" },
    query: {},
  },
  withIncludes: {
    params: { id: "507f1f77bcf86cd799439011" },
    query: { include: "car,user" },
  },
};

/**
 * Error messages for better UX
 */
export const getReviewErrorMessages = {
  id: {
    required: "Review ID is required",
    invalid: "Review ID must be a valid ObjectId",
  },
  include: {
    invalid: "Include parameter can only contain 'car' and/or 'user'",
  },
} as const;
