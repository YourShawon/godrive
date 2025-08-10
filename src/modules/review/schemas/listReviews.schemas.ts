/**
 * List Reviews Query Schemas
 *
 * Zod validation schemas for GET /reviews query parameters
 */

import { z } from "zod";

// Sort order options
const SortOrderEnum = z.enum(["asc", "desc"]);

// Sort field options for reviews
const ReviewSortFieldEnum = z.enum([
  "createdAt",
  "updatedAt",
  "rating",
  "helpful",
]);

// Rating filter options (1-5 stars)
const RatingEnum = z.enum(["1", "2", "3", "4", "5"]);

/**
 * List Reviews Query Parameters Schema
 * Supports filtering, pagination, sorting, and search
 */
export const listReviewsQuerySchemas = z
  .object({
    // Pagination
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, {
        message: "Page must be greater than 0",
      }),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),

    // Sorting
    sortBy: ReviewSortFieldEnum.optional().default("createdAt"),
    sortOrder: SortOrderEnum.optional().default("desc"),

    // Filtering by car
    carId: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid car ID format",
      }),

    // Filtering by user
    userId: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9a-fA-F]{24}$/.test(val), {
        message: "Invalid user ID format",
      }),

    // Rating filter
    rating: RatingEnum.optional(),

    // Minimum rating filter
    minRating: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => !val || (val >= 1 && val <= 5), {
        message: "Minimum rating must be between 1 and 5",
      }),

    // Maximum rating filter
    maxRating: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => !val || (val >= 1 && val <= 5), {
        message: "Maximum rating must be between 1 and 5",
      }),

    // Search in review content/title
    search: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length >= 2, {
        message: "Search query must be at least 2 characters",
      }),

    // Filter by verification status
    verified: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return undefined;
        return val.toLowerCase() === "true";
      }),

    // Date range filtering
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
      }),

    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
      }),

    // Include helpful count filter
    minHelpful: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine((val) => !val || val >= 0, {
        message: "Minimum helpful count must be 0 or greater",
      }),

    // Include car details in response
    includeCar: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return false;
        return val.toLowerCase() === "true";
      }),

    // Include user details in response
    includeUser: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return false;
        return val.toLowerCase() === "true";
      }),
  })
  .refine(
    (data) => {
      // Ensure startDate is before endDate if both are provided
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    {
      message: "Start date must be before or equal to end date",
      path: ["startDate"],
    }
  )
  .refine(
    (data) => {
      // Ensure minRating is less than or equal to maxRating
      if (data.minRating && data.maxRating) {
        return data.minRating <= data.maxRating;
      }
      return true;
    },
    {
      message: "Minimum rating must be less than or equal to maximum rating",
      path: ["minRating"],
    }
  );
