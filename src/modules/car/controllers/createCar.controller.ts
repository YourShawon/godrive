/**
 * Create Car Controller
 *
 * Handle POST /cars for creating new cars
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carService } from "../services/car.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle creating a new car
 * POST /cars
 */
export async function createCar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `create_car_${Date.now()}`;

  try {
    logger.info("🚗 Create car request started", {
      traceId,
      bodyKeys: Object.keys(req.body || {}),
    });

    // Extract car data from validated request body
    const carData = req.body;

    // Create car using service layer
    const newCar = await carService.createCar(carData);

    logger.info("✅ Car created successfully", {
      traceId,
      carId: newCar.id,
      carMake: newCar.make,
      carModel: newCar.model,
      carType: newCar.type,
    });

    res.status(201).json(
      createSuccessResponse(
        "Car created successfully",
        {
          car: newCar,
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
    logger.error("❌ Error creating car", {
      traceId,
      bodyKeys: Object.keys(req.body || {}),
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
