import { z } from "zod";

// Shared types across modules
export type UserId = string;
export type CarId = string;
export type BookingId = string;
export type PaymentId = string;
export type ReviewId = string;

// Common validation schemas
export const PaginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
});

export const IdParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

// Common response types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Success response schema
export const SuccessResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.any().optional(),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  code: z.string(),
  timestamp: z.string().datetime(),
  errors: z
    .array(
      z.object({
        field: z.string(),
        message: z.string(),
        code: z.string(),
      })
    )
    .optional(),
});

// Infer types from schemas
export type PaginationParamsType = z.infer<typeof PaginationParamsSchema>;
export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Database transaction type
export interface DatabaseTransaction {
  // Prisma transaction type will go here
}
