/**
 * Car Service
 *
 * Business logic for car operations
 */

import { logger } from "../../../utils/logger/config.js";
import { ICarRepository } from "../interfaces/car.repository.interface.js";
import {
  Car,
  CreateCarData,
  UpdateCarData,
  ListCarsFilters,
  PaginatedCarsResult,
} from "../types/index.js";

export class CarService {
  constructor(private carRepository: ICarRepository) {}

  /**
   * Create a new car
   */
  async createCar(carData: CreateCarData): Promise<Car> {
    const traceId = `car_service_create_${Date.now()}`;

    try {
      logger.info("🚗 CarService: Creating car", {
        traceId,
        make: carData.make,
        model: carData.model,
        type: carData.type,
      });

      // TODO: Add business logic validations
      // - Validate car specifications
      // - Check for duplicate cars (same make, model, year, location)
      // - Validate pricing
      // - Validate location availability

      const car = await this.carRepository.create(carData);

      logger.info("✅ CarService: Car created successfully", {
        traceId,
        carId: car.id,
        make: car.make,
        model: car.model,
      });

      return car;
    } catch (error) {
      logger.error("❌ CarService: Error creating car", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get car by ID
   */
  async getCarById(id: string): Promise<Car | null> {
    const traceId = `car_service_get_${Date.now()}`;

    try {
      logger.info("🔍 CarService: Getting car by ID", {
        traceId,
        carId: id,
      });

      const car = await this.carRepository.findById(id);

      if (car) {
        logger.info("✅ CarService: Car found", {
          traceId,
          carId: car.id,
        });
      } else {
        logger.warn("⚠️ CarService: Car not found", {
          traceId,
          carId: id,
        });
      }

      return car;
    } catch (error) {
      logger.error("❌ CarService: Error getting car", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * List cars with filters and pagination
   */
  async listCars(filters: ListCarsFilters): Promise<PaginatedCarsResult> {
    const traceId = `car_service_list_${Date.now()}`;

    try {
      logger.info("📋 CarService: Listing cars", {
        traceId,
        filters,
      });

      const result = await this.carRepository.findAll(filters);

      logger.info("✅ CarService: Cars listed successfully", {
        traceId,
        count: result.cars.length,
        total: result.total,
        page: result.page,
      });

      return result;
    } catch (error) {
      logger.error("❌ CarService: Error listing cars", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update car by ID
   */
  async updateCar(id: string, carData: UpdateCarData): Promise<Car | null> {
    const traceId = `car_service_update_${Date.now()}`;

    try {
      logger.info("🔄 CarService: Updating car", {
        traceId,
        carId: id,
        updateFields: Object.keys(carData),
      });

      // TODO: Add business logic validations
      // - Validate update permissions
      // - Check if car has active bookings before certain updates
      // - Validate price changes
      // - Log price history if needed

      const car = await this.carRepository.update(id, carData);

      if (car) {
        logger.info("✅ CarService: Car updated successfully", {
          traceId,
          carId: car.id,
        });
      } else {
        logger.warn("⚠️ CarService: Car not found for update", {
          traceId,
          carId: id,
        });
      }

      return car;
    } catch (error) {
      logger.error("❌ CarService: Error updating car", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Delete car by ID
   */
  async deleteCar(id: string): Promise<boolean> {
    const traceId = `car_service_delete_${Date.now()}`;

    try {
      logger.info("🗑️ CarService: Deleting car", {
        traceId,
        carId: id,
      });

      // TODO: Add business logic validations
      // - Check if car has active bookings
      // - Check if car has pending payments
      // - Archive car instead of hard delete if needed

      const success = await this.carRepository.delete(id);

      if (success) {
        logger.info("✅ CarService: Car deleted successfully", {
          traceId,
          carId: id,
        });
      } else {
        logger.warn("⚠️ CarService: Car not found for deletion", {
          traceId,
          carId: id,
        });
      }

      return success;
    } catch (error) {
      logger.error("❌ CarService: Error deleting car", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update car availability
   */
  async updateCarAvailability(
    id: string,
    isAvailable: boolean
  ): Promise<Car | null> {
    const traceId = `car_service_availability_${Date.now()}`;

    try {
      logger.info("🔄 CarService: Updating car availability", {
        traceId,
        carId: id,
        isAvailable,
      });

      const car = await this.carRepository.updateAvailability(id, isAvailable);

      if (car) {
        logger.info("✅ CarService: Car availability updated", {
          traceId,
          carId: car.id,
          isAvailable: car.isAvailable,
        });
      }

      return car;
    } catch (error) {
      logger.error("❌ CarService: Error updating car availability", {
        traceId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export service instance
import { carRepository } from "../repositories/car.repository.js";
export const carService = new CarService(carRepository);
