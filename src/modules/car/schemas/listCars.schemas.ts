/**
 * List Cars Query Schemas
 *
 * Zod validation schemas for GET /cars query parameters
 */

import { z } from "zod";

// Car types enum for validation
const CarTypeEnum = z.enum([
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "COUPE",
  "CONVERTIBLE",
  "PICKUP",
  "VAN",
]);

// Transmission enum
const TransmissionEnum = z.enum(["MANUAL", "AUTOMATIC", "CVT"]);

// Fuel type enum
const FuelTypeEnum = z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]);

// Sort field options
const SortFieldEnum = z.enum([
  "createdAt",
  "updatedAt",
  "pricePerDay",
  "year",
  "make",
  "model",
]);

// Sort order options
const SortOrderEnum = z.enum(["asc", "desc"]);

/**
 * List Cars Query Parameters Schema
 * Validates and transforms query parameters for GET /cars
 */
export const ListCarsQuerySchema = z
  .object({
    // Pagination
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: "Page must be greater than 0" }),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10))
      .refine((val) => val > 0 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),

    // Filters
    make: z.string().min(1).max(50).optional(),

    type: CarTypeEnum.optional(),

    transmission: TransmissionEnum.optional(),

    fuelType: FuelTypeEnum.optional(),

    location: z.string().min(1).max(100).optional(),

    isAvailable: z
      .string()
      .optional()
      .transform((val) => {
        if (val === undefined) return undefined;
        if (val === "true") return true;
        if (val === "false") return false;
        throw new Error("isAvailable must be 'true' or 'false'");
      }),

    // Price range
    minPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "minPrice must be 0 or greater",
      }),

    maxPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined))
      .refine((val) => val === undefined || val >= 0, {
        message: "maxPrice must be 0 or greater",
      }),

    // Year range
    minYear: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) =>
          val === undefined ||
          (val >= 1990 && val <= new Date().getFullYear() + 2),
        {
          message: "minYear must be between 1990 and current year + 2",
        }
      ),

    maxYear: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) =>
          val === undefined ||
          (val >= 1990 && val <= new Date().getFullYear() + 2),
        {
          message: "maxYear must be between 1990 and current year + 2",
        }
      ),

    // Sorting
    sort: SortFieldEnum.optional().default("createdAt"),

    order: SortOrderEnum.optional().default("desc"),

    // Search
    search: z.string().min(1).max(100).optional(),
  })
  .refine(
    (data) => {
      // Custom validation: minPrice should not be greater than maxPrice
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "minPrice cannot be greater than maxPrice",
      path: ["minPrice"],
    }
  )
  .refine(
    (data) => {
      // Custom validation: minYear should not be greater than maxYear
      if (data.minYear !== undefined && data.maxYear !== undefined) {
        return data.minYear <= data.maxYear;
      }
      return true;
    },
    {
      message: "minYear cannot be greater than maxYear",
      path: ["minYear"],
    }
  );

/**
 * TypeScript type inferred from schema
 */
export type ListCarsQuery = z.infer<typeof ListCarsQuerySchema>;

/**
 * Available car types for frontend reference
 */
export const CAR_TYPES = [
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "COUPE",
  "CONVERTIBLE",
  "PICKUP",
  "VAN",
] as const;

/**
 * Available sort fields for frontend reference
 */
export const SORT_FIELDS = [
  "createdAt",
  "updatedAt",
  "pricePerDay",
  "year",
  "make",
  "model",
] as const;
