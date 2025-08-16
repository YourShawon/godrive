/**
 * Create Review Validation Schemas
 *
 * Zod schemas for validating review creation requests
 */

import { z } from "zod";

/**
 * MongoDB ObjectId validation pattern
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format");

/**
 * Schema for validating review creation request body
 */
export const createReviewBodySchema = z.object({
  carId: objectIdSchema.describe("ID of the car being reviewed"),

  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5")
    .describe("Rating from 1 to 5 stars"),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must be at most 100 characters long")
    .describe("Review title/summary"),

  comment: z
    .string()
    .trim()
    .min(10, "Comment must be at least 10 characters long")
    .max(1000, "Comment must be at most 1000 characters long")
    .optional()
    .describe("Detailed review comment (optional)"),
});

/**
 * Type inference for create review request body
 */
export type CreateReviewBody = z.infer<typeof createReviewBodySchema>;

/**
 * Schema for validating the complete review creation request
 * (includes both body and potential query parameters)
 */
export const createReviewRequestSchema = z.object({
  body: createReviewBodySchema,
});

/**
 * Example valid request body for documentation
 */
export const createReviewExample: CreateReviewBody = {
  carId: "507f1f77bcf86cd799439011",
  rating: 5,
  title: "Excellent car, smooth ride!",
  comment:
    "Had a fantastic experience with this car. The engine was smooth, comfortable seats, and great fuel efficiency. Highly recommend for long trips.",
};

/**
 * Schema validation error messages for better UX
 */
export const createReviewErrorMessages = {
  carId: {
    required: "Car ID is required",
    invalid: "Car ID must be a valid ObjectId",
  },
  rating: {
    required: "Rating is required",
    invalid: "Rating must be a number between 1 and 5",
    range: "Rating must be between 1 and 5 stars",
  },
  title: {
    required: "Review title is required",
    minLength: "Title must be at least 3 characters long",
    maxLength: "Title cannot exceed 100 characters",
  },
  comment: {
    minLength: "Comment must be at least 10 characters long",
    maxLength: "Comment cannot exceed 1000 characters",
  },
} as const;
