/**
 * Car Repository
 *
 * Responsibilities:
 * - Handle car data access operations
 * - Provide clean interface for car database operations
 * - Abstract database implementation details
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";

export class CarRepository {
  /**
   * Find a car by ID
   * @param id - Car ID to search for
   * @returns Car data or null if not found
   */
  async findById(id: string) {
    try {
      logger.info("🔍 CarRepository: Finding car by ID", { carId: id });

      const car = await prisma.car.findUnique({
        where: { id },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          type: true,
          color: true,
          transmission: true,
          fuelType: true,
          seats: true,
          doors: true,
          airConditioning: true,
          pricePerDay: true,
          isAvailable: true,
          location: true,
          images: true,
          description: true,
          features: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (car) {
        logger.info("✅ Car found successfully", { carId: id });
      } else {
        logger.warn("⚠️ Car not found", { carId: id });
      }

      return car;
    } catch (error) {
      logger.error("❌ Error finding car by ID", {
        carId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export a singleton instance
export const carRepository = new CarRepository();
