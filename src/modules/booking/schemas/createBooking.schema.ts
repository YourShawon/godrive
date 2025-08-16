/**
 * Create Booking Validation Schema
 *
 * Zod schema for validating booking creation requests
 */

import { z } from "zod";

/**
 * MongoDB ObjectId validation regex
 */
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Create Booking Request Schema
 */
export const createBookingSchema = z
  .object({
    carId: z
      .string()
      .regex(objectIdRegex, "Invalid car ID format")
      .describe("MongoDB ObjectId of the car to book"),

    startDate: z
      .string()
      .datetime("Invalid start date format. Use YYYY-MM-DD or ISO string")
      .or(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      )
      .transform((dateStr) => new Date(dateStr))
      .refine((date) => date > new Date(), "Start date must be in the future"),

    endDate: z
      .string()
      .datetime("Invalid end date format. Use YYYY-MM-DD or ISO string")
      .or(
        z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      )
      .transform((dateStr) => new Date(dateStr)),

    notes: z
      .string()
      .max(500, "Notes cannot exceed 500 characters")
      .optional()
      .describe("Optional booking notes or special requests"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"], // Error will be associated with endDate field
  });

/**
 * TypeScript type for validated create booking request
 */
export type CreateBookingRequest = z.infer<typeof createBookingSchema>;
