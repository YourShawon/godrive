/**
 * Create Car Validation Schemas
 *
 * Zod validation schemas for POST /cars request body
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
 * Create Car Request Body Schema
 * Validates and transforms request body for POST /cars
 */
export const CreateCarSchema = z
  .object({
    // Basic car information
    make: z
      .string()
      .min(1, "Make is required")
      .max(50, "Make must be less than 50 characters")
      .trim(),

    model: z
      .string()
      .min(1, "Model is required")
      .max(50, "Model must be less than 50 characters")
      .trim(),

    year: z
      .number()
      .int("Year must be an integer")
      .min(1990, "Year must be 1990 or later")
      .max(
        new Date().getFullYear() + 2,
        `Year cannot be more than ${new Date().getFullYear() + 2}`
      ),

    type: CarTypeEnum,

    color: z
      .string()
      .min(1, "Color is required")
      .max(30, "Color must be less than 30 characters")
      .trim(),

    // Technical specifications
    transmission: TransmissionEnum,

    fuelType: FuelTypeEnum,

    seats: z
      .number()
      .int("Seats must be an integer")
      .min(1, "Must have at least 1 seat")
      .max(12, "Cannot have more than 12 seats"),

    doors: z
      .number()
      .int("Doors must be an integer")
      .min(2, "Must have at least 2 doors")
      .max(5, "Cannot have more than 5 doors"),

    airConditioning: z.boolean(),

    // Pricing and availability
    pricePerDay: z
      .number()
      .positive("Price per day must be positive")
      .multipleOf(
        0.01,
        "Price must be in valid currency format (2 decimal places)"
      )
      .max(10000, "Price per day cannot exceed $10,000"),

    isAvailable: z.boolean().optional().default(true),

    // Location and media
    location: z
      .string()
      .min(1, "Location is required")
      .max(100, "Location must be less than 100 characters")
      .trim(),

    images: z
      .array(
        z
          .string()
          .url("Each image must be a valid URL")
          .max(500, "Image URL must be less than 500 characters")
      )
      .max(10, "Cannot have more than 10 images")
      .optional()
      .default([]),

    // Description and features
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(1000, "Description must be less than 1000 characters")
      .trim(),

    features: z
      .array(
        z
          .string()
          .min(1, "Feature cannot be empty")
          .max(100, "Each feature must be less than 100 characters")
          .trim()
      )
      .max(20, "Cannot have more than 20 features")
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      // Custom validation: Convertibles should have 2 doors
      if (data.type === "CONVERTIBLE" && data.doors !== 2) {
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
      // Custom validation: Vans should have more seats
      if (data.type === "VAN" && data.seats < 6) {
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
      // Custom validation: Sedans should have 4 doors
      if (data.type === "SEDAN" && data.doors !== 4) {
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
export type CreateCarData = z.infer<typeof CreateCarSchema>;

/**
 * Car creation response schema
 */
export const CreateCarResponseSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number(),
  type: CarTypeEnum,
  color: z.string(),
  transmission: TransmissionEnum,
  fuelType: FuelTypeEnum,
  seats: z.number(),
  doors: z.number(),
  airConditioning: z.boolean(),
  pricePerDay: z.number(),
  isAvailable: z.boolean(),
  location: z.string(),
  images: z.array(z.string()),
  description: z.string(),
  features: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * Available car types for reference
 */
export const AVAILABLE_CAR_TYPES = [
  "SEDAN",
  "SUV",
  "HATCHBACK",
  "COUPE",
  "CONVERTIBLE",
  "PICKUP",
  "VAN",
] as const;

/**
 * Available transmissions for reference
 */
export const AVAILABLE_TRANSMISSIONS = ["MANUAL", "AUTOMATIC", "CVT"] as const;

/**
 * Available fuel types for reference
 */
export const AVAILABLE_FUEL_TYPES = [
  "PETROL",
  "DIESEL",
  "HYBRID",
  "ELECTRIC",
] as const;
