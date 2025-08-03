import { z } from "zod";

/**
 * MongoDB ObjectId validation
 * ObjectId must be a 24-character hexadecimal string
 */
const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
  .describe("MongoDB ObjectId (24-character hexadecimal string)");

/**
 * Car ID parameter validation
 * For validating route parameters like /cars/:id
 */
export const CarIdParamsSchema = z.object({
  id: objectIdSchema,
});

/**
 * Type inference for Car ID parameters
 */
export type CarIdParams = z.infer<typeof CarIdParamsSchema>;
