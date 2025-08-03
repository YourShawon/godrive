/**
 * Get Car Controller
 *
 * Simple function-based controller for retrieving a single car
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carRepository } from "../repositories/car.repository.js";

/**
 * Handle getting a single car by ID
 * GET /cars/:id
 */
export async function getCar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = `get_car_${Date.now()}`;
  const carId = req.params.id as string; // Validated by middleware

  try {
    logger.info("🚗 Get car request started", {
      requestId,
      carId,
    });

    // Find car using repository
    const car = await carRepository.findById(carId);

    if (!car) {
      logger.warn("⚠️ Car not found", { requestId, carId });
      res.status(404).json({
        success: false,
        message: "Car not found",
        error: {
          code: "CAR_NOT_FOUND",
          description: "The requested car does not exist",
        },
        requestId,
      });
      return;
    }

    logger.info("✅ Car retrieved successfully", {
      requestId,
      carId,
      carMake: car.make,
      carModel: car.model,
    });

    res.status(200).json({
      success: true,
      message: "Car retrieved successfully",
      data: car,
      requestId,
    });
  } catch (error) {
    logger.error("❌ Error getting car", {
      requestId,
      carId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
