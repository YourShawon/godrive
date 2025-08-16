/**
 * Car Repository Interface
 *
 * Defines the contract for car data access operations
 */

import {
  Car,
  CreateCarData,
  UpdateCarData,
  ListCarsFilters,
  PaginatedCarsResult,
} from "../types/index.js";

export interface ICarRepository {
  /**
   * Create a new car
   */
  create(carData: CreateCarData): Promise<Car>;

  /**
   * Find a car by ID
   */
  findById(id: string): Promise<Car | null>;

  /**
   * Find all cars with pagination and filtering
   */
  findAll(filters: ListCarsFilters): Promise<PaginatedCarsResult>;

  /**
   * Update a car by ID
   */
  update(id: string, carData: UpdateCarData): Promise<Car | null>;

  /**
   * Delete a car by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if a car exists by ID
   */
  exists(id: string): Promise<boolean>;

  /**
   * Find cars by availability
   */
  findByAvailability(isAvailable: boolean): Promise<Car[]>;

  /**
   * Find cars by location
   */
  findByLocation(location: string): Promise<Car[]>;

  /**
   * Update car availability
   */
  updateAvailability(id: string, isAvailable: boolean): Promise<Car | null>;
}
