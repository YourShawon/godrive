/**
 * Get Booking Validation Schema
 *
 * Zod schema for validating booking ID parameters
 */

import { z } from "zod";

/**
 * MongoDB ObjectId validation regex
 */
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

/**
 * Get Booking Params Schema
 * Validates the booking ID in URL parameters
 */
export const getBookingParamsSchema = z.object({
  id: z
    .string()
    .regex(objectIdRegex, "Invalid booking ID format")
    .describe("MongoDB ObjectId of the booking to retrieve"),
});

/**
 * TypeScript type for validated get booking params
 */
export type GetBookingParams = z.infer<typeof getBookingParamsSchema>;
