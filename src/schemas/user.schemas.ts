import { z } from "zod";

/**
 * Common validation schemas for User-related operations
 */

// MongoDB ObjectId validation
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format")
  .describe("MongoDB ObjectId");

// Email validation with comprehensive checks
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .max(254, "Email too long")
  .email("Invalid email format")
  .toLowerCase();

// Password validation for creation/updates
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
  .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
  .regex(/(?=.*\d)/, "Password must contain at least one number")
  .regex(
    /(?=.*[@$!%*?&])/,
    "Password must contain at least one special character"
  );

// Name validation (first/last name)
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name too long")
  .regex(
    /^[a-zA-Z\s'-]+$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes"
  )
  .trim();

// Phone number validation (international format)
export const phoneSchema = z
  .string()
  .regex(
    /^\+[1-9]\d{1,14}$/,
    "Invalid phone number format (use international format: +1234567890)"
  )
  .optional();

// URL validation
export const urlSchema = z
  .string()
  .url("Invalid URL format")
  .max(2048, "URL too long")
  .optional();

// Date validation (ISO string)
export const dateSchema = z
  .string()
  .datetime("Invalid date format (ISO 8601 required)")
  .or(z.date());

// Pagination schemas
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, "Page must be greater than 0")
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a positive integer")
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, "Limit must be between 1 and 100")
    .optional()
    .default(10),
  sort: z.string().max(50, "Sort field name too long").optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Search query schema
export const searchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(200, "Search query too long")
    .trim()
    .optional(),
  fields: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0)
    )
    .refine((fields) => fields.length <= 10, "Too many fields specified")
    .optional(),
});

/**
 * User-specific schemas
 */

// User creation schema
export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(["user", "admin"]).optional().default("user"),
  isActive: z.boolean().optional().default(true),
});

// User update schema (all fields optional)
export const updateUserSchema = z
  .object({
    email: emailSchema.optional(),
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    phone: phoneSchema,
    role: z.enum(["user", "admin"]).optional(),
    isActive: z.boolean().optional(),
    profilePicture: urlSchema,
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

// User params schema (for :id routes)
export const userParamsSchema = z.object({
  id: objectIdSchema,
});

// User query schema (for GET /users)
export const userQuerySchema = z.object({
  ...paginationQuerySchema.shape,
  ...searchQuerySchema.shape,
  role: z.enum(["user", "admin"]).optional(),
  isActive: z
    .string()
    .transform((val) => val.toLowerCase())
    .refine(
      (val) => ["true", "false"].includes(val),
      "isActive must be true or false"
    )
    .transform((val) => val === "true")
    .optional(),
  createdAfter: dateSchema.optional(),
  createdBefore: dateSchema.optional(),
});

// Password change schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Pre-configured validation middleware for common user operations
 */
export const userValidation = {
  // GET /users/:id
  getUser: {
    params: userParamsSchema,
  },

  // PUT /users/:id
  updateUser: {
    params: userParamsSchema,
    body: updateUserSchema,
  },

  // GET /users
  getUsers: {
    query: userQuerySchema,
  },

  // POST /users
  createUser: {
    body: createUserSchema,
  },

  // POST /auth/login
  login: {
    body: loginSchema,
  },

  // PUT /users/:id/password
  changePassword: {
    params: userParamsSchema,
    body: changePasswordSchema,
  },
};
