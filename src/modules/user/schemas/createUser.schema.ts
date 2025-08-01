/**
 * Create User Schema - Input Validation & Type Safety
 *
 * This schema defines the data contract for user creation:
 * - What data clients must send
 * - Validation rules for each field
 * - TypeScript types inferred from schema
 * - Transformation rules (e.g., email normalization)
 *
 * Following FAANG standards for API input validation
 */

import { z } from "zod";
import { Role, CarType } from "@prisma/client";

/**
 * Password validation rules (enterprise security standards)
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password cannot exceed 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  );

/**
 * Email validation with normalization
 */
const emailSchema = z
  .string()
  .email("Invalid email format")
  .min(5, "Email must be at least 5 characters")
  .max(254, "Email cannot exceed 254 characters") // RFC 5321 limit
  .transform((email) => email.toLowerCase().trim()); // Normalize email

/**
 * Name validation
 */
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name cannot exceed 100 characters")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .transform((name) => name.trim());

/**
 * Phone validation (international format)
 */
const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => {
    if (!phone) return true; // Optional field
    return /^\+[1-9]\d{1,14}$/.test(phone); // E.164 international format
  }, "Phone must be in international format (e.g., +1234567890)");

/**
 * Main Create User Schema
 * Defines the complete input validation for user creation
 */
export const createUserSchema = z.object({
  // Required fields
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,

  // Optional fields with defaults
  role: z.nativeEnum(Role).default(Role.CUSTOMER),

  // User preferences (optional)
  preferredCarTypes: z.array(z.nativeEnum(CarType)).optional(),
  language: z.string().min(2).max(5).default("en"), // ISO 639-1 format
  currency: z.string().length(3).default("USD"), // ISO 4217 format

  // Contact info (optional)
  phone: phoneSchema,

  // Location (optional - can be set later)
  location: z
    .object({
      country: z.string().min(2).max(100),
      state: z.string().min(2).max(100),
      city: z.string().min(2).max(100),
      street: z.string().min(5).max(255),
    })
    .optional(),
});

/**
 * TypeScript types inferred from schema
 */
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateUserInputRaw = z.input<typeof createUserSchema>; // Before transformation

/**
 * Response schema - what we return to the client
 * Excludes sensitive fields like password
 */
export const createUserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(Role),
  preferredCarTypes: z.array(z.nativeEnum(CarType)).optional(),
  language: z.string(),
  currency: z.string(),
  phone: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  // Note: password and other sensitive fields are excluded
});

export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;

/**
 * Validation helper functions
 */
export const validateCreateUserInput = (input: unknown) => {
  return createUserSchema.safeParse(input);
};

export const validateCreateUserResponse = (response: unknown) => {
  return createUserResponseSchema.safeParse(response);
};

/**
 * Error messages for common validation failures
 */
export const CREATE_USER_VALIDATION_ERRORS = {
  EMAIL_REQUIRED: "Email is required",
  EMAIL_INVALID: "Invalid email format",
  EMAIL_TOO_LONG: "Email cannot exceed 254 characters",
  PASSWORD_REQUIRED: "Password is required",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_TOO_WEAK:
    "Password must contain uppercase, lowercase, number, and special character",
  NAME_REQUIRED: "Name is required",
  NAME_TOO_SHORT: "Name must be at least 2 characters",
  NAME_INVALID_CHARS: "Name contains invalid characters",
  PHONE_INVALID_FORMAT: "Phone must be in international format",
  ROLE_INVALID: "Invalid role specified",
  LANGUAGE_INVALID: "Language must be a valid ISO 639-1 code",
  CURRENCY_INVALID: "Currency must be a valid ISO 4217 code",
} as const;

/**
 * Example usage:
 *
 * const result = validateCreateUserInput({
 *   email: "user@example.com",
 *   password: "SecurePass123!",
 *   name: "John Doe",
 *   role: "CUSTOMER"
 * });
 *
 * if (result.success) {
 *   const userData = result.data; // Fully typed and validated
 * } else {
 *   const errors = result.error.issues; // Detailed validation errors
 * }
 */
