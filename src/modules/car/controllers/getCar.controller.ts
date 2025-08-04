/**
 * Get Car Controller
 *
 * Simple function-based controller for retrieving a single car
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carRepository } from "../repositories/car.repository.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle getting a single car by ID
 * GET /cars/:id
 */
export async function getCar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `get_car_${Date.now()}`;
  const carId = req.params.id as string; // Validated by middleware

  try {
    logger.info("🚗 Get car request started", {
      traceId,
      carId,
    });

    // Find car using repository
    const car = await carRepository.findById(carId);

    if (!car) {
      logger.warn("⚠️ Car not found", { traceId, carId });

      res
        .status(404)
        .json(
          createErrorResponse(
            "Car not found",
            "CAR_NOT_FOUND",
            { carId },
            traceId
          )
        );
      return;
    }

    logger.info("✅ Car retrieved successfully", {
      traceId,
      carId,
      carMake: car.make,
      carModel: car.model,
    });

    res.status(200).json(
      createSuccessResponse(
        "Car retrieved successfully",
        {
          car,
          meta: {
            processedBy: "car-service",
            version: "1.0",
            timestamp: new Date().toISOString(),
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error getting car", {
      traceId,
      carId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
