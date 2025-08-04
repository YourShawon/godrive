/**
 * Update Car Validation Schemas
 *
 * Zod validation schemas for PUT /cars/:id request body
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

/**
 * Update Car Request Body Schema
 * All fields are optional for partial updates
 */
export const UpdateCarSchema = z
  .object({
    // Basic car information (all optional)
    make: z
      .string()
      .min(1, "Make cannot be empty")
      .max(50, "Make must be less than 50 characters")
      .trim()
      .optional(),

    model: z
      .string()
      .min(1, "Model cannot be empty")
      .max(50, "Model must be less than 50 characters")
      .trim()
      .optional(),

    year: z
      .number()
      .int("Year must be an integer")
      .min(1990, "Year must be 1990 or later")
      .max(
        new Date().getFullYear() + 2,
        `Year cannot be more than ${new Date().getFullYear() + 2}`
      )
      .optional(),

    type: CarTypeEnum.optional(),

    color: z
      .string()
      .min(1, "Color cannot be empty")
      .max(30, "Color must be less than 30 characters")
      .trim()
      .optional(),

    // Technical specifications
    transmission: TransmissionEnum.optional(),

    fuelType: FuelTypeEnum.optional(),

    seats: z
      .number()
      .int("Seats must be an integer")
      .min(1, "Must have at least 1 seat")
      .max(12, "Cannot have more than 12 seats")
      .optional(),

    doors: z
      .number()
      .int("Doors must be an integer")
      .min(2, "Must have at least 2 doors")
      .max(5, "Cannot have more than 5 doors")
      .optional(),

    airConditioning: z.boolean().optional(),

    // Pricing and availability
    pricePerDay: z
      .number()
      .positive("Price per day must be positive")
      .multipleOf(
        0.01,
        "Price must be in valid currency format (2 decimal places)"
      )
      .max(10000, "Price per day cannot exceed $10,000")
      .optional(),

    isAvailable: z.boolean().optional(),

    // Location and media
    location: z
      .string()
      .min(1, "Location cannot be empty")
      .max(100, "Location must be less than 100 characters")
      .trim()
      .optional(),

    images: z
      .array(
        z
          .string()
          .url("Each image must be a valid URL")
          .max(500, "Image URL must be less than 500 characters")
      )
      .max(10, "Cannot have more than 10 images")
      .optional(),

    // Description and features
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters")
      .trim()
      .optional(),

    features: z
      .array(
        z
          .string()
          .min(1, "Feature cannot be empty")
          .max(100, "Each feature must be less than 100 characters")
          .trim()
      )
      .max(20, "Cannot have more than 20 features")
      .optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one field is provided for update
      const hasAtLeastOneField = Object.keys(data).some(
        (key) => data[key as keyof typeof data] !== undefined
      );
      return hasAtLeastOneField;
    },
    {
      message: "At least one field must be provided for update",
      path: [],
    }
  )
  .refine(
    (data) => {
      // Custom validation: Convertibles should have 2 doors (only if both type and doors are being updated)
      if (
        data.type === "CONVERTIBLE" &&
        data.doors !== undefined &&
        data.doors !== 2
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Convertibles must have exactly 2 doors",
      path: ["doors"],
    }
  )
  .refine(
    (data) => {
      // Custom validation: Vans should have more seats (only if both type and seats are being updated)
      if (data.type === "VAN" && data.seats !== undefined && data.seats < 6) {
        return false;
      }
      return true;
    },
    {
      message: "Vans must have at least 6 seats",
      path: ["seats"],
    }
  )
  .refine(
    (data) => {
      // Custom validation: Sedans should have 4 doors (only if both type and doors are being updated)
      if (
        data.type === "SEDAN" &&
        data.doors !== undefined &&
        data.doors !== 4
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Sedans must have exactly 4 doors",
      path: ["doors"],
    }
  );

/**
 * TypeScript type inferred from schema
 */
export type UpdateCarData = z.infer<typeof UpdateCarSchema>;

/**
 * Fields that cannot be updated after creation (business rules)
 */
export const IMMUTABLE_FIELDS = [
  // Currently allowing all fields to be updated
  // In future, might restrict: "id", "createdAt"
] as const;

/**
 * Fields that require special permissions to update
 */
export const ADMIN_ONLY_FIELDS = [
  // Future: might restrict certain fields to admin only
  // "isAvailable", "pricePerDay"
] as const;

/**
 * Common update scenarios for validation
 */
export const UPDATE_SCENARIOS = {
  PRICE_UPDATE: ["pricePerDay"],
  AVAILABILITY_UPDATE: ["isAvailable"],
  BASIC_INFO_UPDATE: ["make", "model", "year", "color"],
  TECHNICAL_UPDATE: [
    "transmission",
    "fuelType",
    "seats",
    "doors",
    "airConditioning",
  ],
  CONTENT_UPDATE: ["description", "features", "images"],
  LOCATION_UPDATE: ["location"],
  FULL_UPDATE: "all_fields",
} as const;
