/**
 * Car Module Types
 *
 * TypeScript types and interfaces for the car module
 */

import {
  Car as PrismaCar,
  CarType,
  TransmissionType,
  FuelType,
} from "@prisma/client";

// Car entity type (using Prisma generated types)
export type Car = PrismaCar;

// Re-export Prisma enums
export { CarType, TransmissionType, FuelType };

// Create car input type
export interface CreateCarData {
  make: string;
  model: string;
  year: number;
  type: CarType;
  color: string;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  airConditioning?: boolean;
  pricePerDay: number;
  isAvailable?: boolean;
  location: string;
  images: string[];
  description?: string;
  features: string[];
}

// Update car input type
export interface UpdateCarData {
  make?: string;
  model?: string;
  year?: number;
  type?: CarType;
  color?: string;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  seats?: number;
  doors?: number;
  airConditioning?: boolean;
  pricePerDay?: number;
  isAvailable?: boolean;
  location?: string;
  images?: string[];
  description?: string;
  features?: string[];
}

// List cars filters type
export interface ListCarsFilters {
  make?: string;
  model?: string;
  type?: CarType;
  minPrice?: number;
  maxPrice?: number;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  seats?: number;
  isAvailable?: boolean;
  location?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

// Paginated result type
export interface PaginatedCarsResult {
  cars: Car[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
