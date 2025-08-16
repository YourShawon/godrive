/**
 * List Bookings Validation Schema
 *
 * Zod schema for validating booking list query parameters
 */

import { z } from "zod";
import { BookingStatus } from "../types/index.js";

/**
 * List Bookings Query Schema
 * Validates query parameters for booking list endpoint
 */
export const listBookingsQuerySchema = z
  .object({
    // Pagination
    page: z
      .string()
      .optional()
      .default("1")
      .transform((val) => parseInt(val, 10))
      .refine((val) => val > 0, "Page must be greater than 0"),

    limit: z
      .string()
      .optional()
      .default("10")
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => val > 0 && val <= 100,
        "Limit must be between 1 and 100"
      ),

    // Filtering
    status: z
      .enum([
        BookingStatus.PENDING,
        BookingStatus.CONFIRMED,
        BookingStatus.ACTIVE,
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ])
      .optional()
      .describe("Filter bookings by status"),

    carId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid car ID format")
      .optional()
      .describe("Filter bookings by car ID"),

    // Date range filtering
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional()
      .transform((dateStr) => (dateStr ? new Date(dateStr) : undefined))
      .describe("Filter bookings starting from this date"),

    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .optional()
      .transform((dateStr) => (dateStr ? new Date(dateStr) : undefined))
      .describe("Filter bookings ending before this date"),

    // Sorting
    sortBy: z
      .enum(["createdAt", "startDate", "endDate", "totalPrice"])
      .optional()
      .default("createdAt")
      .describe("Field to sort by"),

    sortOrder: z
      .enum(["asc", "desc"])
      .optional()
      .default("desc")
      .describe("Sort order"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

/**
 * TypeScript type for validated list bookings query
 */
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;
