/**
 * Update User Schema
 * Reuses validation logic from createUser but makes fields optional for partial updates
 */

import { z } from "zod";
import { createUserSchema } from "./createUser.schema.js";

/**
 * Update User Input - All fields optional except password handling
 * Reuses createUser validation but makes everything optional
 */
export const updateUserSchema = createUserSchema
  .omit({ password: true }) // Remove password from regular updates
  .partial(); // Make all fields optional

/**
 * Password Change Schema - Separate endpoint for security
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),

    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number")
      .regex(
        /(?=.*[@$!%*?&])/,
        "Password must contain at least one special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password don't match",
    path: ["confirmPassword"],
  });

// Type inference for TypeScript
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// Response type (reuse SafeUser from existing patterns)
export type UpdateUserResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  updatedAt: Date;
};
