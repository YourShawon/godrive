import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long");

// User registration schema
export const RegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: passwordSchema,
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  preferences: z
    .object({
      preferredCarTypes: z
        .array(
          z.enum([
            "SUV",
            "SEDAN",
            "HATCHBACK",
            "COUPE",
            "CONVERTIBLE",
            "PICKUP",
            "VAN",
          ])
        )
        .optional(),
      language: z.enum(["en", "es", "fr", "de"]).default("en"),
      currency: z.enum(["USD", "EUR", "GBP", "CAD"]).default("USD"),
    })
    .optional(),
});

// User login schema
export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Refresh token schema
export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

// Forgot password schema
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Reset password schema
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordSchema,
});

// Change password schema
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

// Update user profile schema
export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  preferences: z
    .object({
      preferredCarTypes: z
        .array(
          z.enum([
            "SUV",
            "SEDAN",
            "HATCHBACK",
            "COUPE",
            "CONVERTIBLE",
            "PICKUP",
            "VAN",
          ])
        )
        .optional(),
      language: z.enum(["en", "es", "fr", "de"]).optional(),
      currency: z.enum(["USD", "EUR", "GBP", "CAD"]).optional(),
    })
    .optional(),
});

// User response schema (what we return to client - no password)
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  phone: z.string().optional(),
  role: z.enum(["CUSTOMER", "ADMIN", "SUPPORT"]),
  isEmailVerified: z.boolean(),
  preferences: z
    .object({
      preferredCarTypes: z.array(z.string()).optional(),
      language: z.string(),
      currency: z.string(),
    })
    .optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Auth response schema
export const AuthResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  data: z.object({
    user: UserResponseSchema,
    tokens: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
      expiresIn: z.number(),
    }),
  }),
});

// Infer types from schemas
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
