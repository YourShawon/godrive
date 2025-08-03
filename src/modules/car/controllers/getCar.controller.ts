/**
 * Get Car Controller
 *
 * Simple function-based controller for retrieving a single car
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";

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

  try {
    logger.info("🚗 Get car request started", {
      requestId,
      carId: req.params.id,
    });

    // For now, let's just return a mock response to test the route
    const mockCar = {
      id: req.params.id,
      make: "Toyota",
      model: "Camry",
      year: 2023,
      type: "SEDAN",
      pricePerDay: 45.99,
      isAvailable: true,
    };

    logger.info("✅ Car retrieved successfully", {
      requestId,
      carId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Car retrieved successfully",
      data: mockCar,
      requestId,
    });
  } catch (error) {
    logger.error("❌ Error getting car", {
      requestId,
      carId: req.params.id,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
