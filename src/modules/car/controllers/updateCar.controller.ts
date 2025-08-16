/**
 * Update Car Controller
 *
 * Handle PUT /cars/:id for updating existing cars
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carService } from "../services/car.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle updating an existing car
 * PUT /cars/:id
 */
export async function updateCar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `update_car_${Date.now()}`;
  const carId = req.params.id as string; // Validated by middleware

  try {
    logger.info("🚗 Update car request started", {
      traceId,
      carId,
      bodyKeys: Object.keys(req.body || {}),
    });

    // Extract update data from validated request body
    const updateData = req.body;

    // Update car using service layer
    const updatedCar = await carService.updateCar(carId, updateData);

    if (!updatedCar) {
      logger.warn("⚠️ Car not found for update", { traceId, carId });

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

    logger.info("✅ Car updated successfully", {
      traceId,
      carId,
      carMake: updatedCar.make,
      carModel: updatedCar.model,
      updatedFields: Object.keys(updateData),
    });

    res.status(200).json(
      createSuccessResponse(
        "Car updated successfully",
        {
          car: updatedCar,
          meta: {
            processedBy: "car-service",
            version: "1.0",
            timestamp: new Date().toISOString(),
            updatedFields: Object.keys(updateData),
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error updating car", {
      traceId,
      carId,
      bodyKeys: Object.keys(req.body || {}),
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
