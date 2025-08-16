/**
 * List Cars Controller
 *
 * Handle GET /cars with pagination, filtering, and sorting
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carService } from "../services/car.service.js";
import { createSuccessResponse } from "../../../utils/responses.js";

/**
 * Handle listing cars with query parameters
 * GET /cars?page=1&limit=10&make=Toyota&type=SEDAN&sort=pricePerDay&order=asc
 */
export async function listCars(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `list_cars_${Date.now()}`;

  try {
    logger.info("🚗 List cars request started", {
      traceId,
      query: req.query,
    });

    // Extract and validate query parameters (validated by middleware)
    const {
      page = 1,
      limit = 10,
      make,
      model,
      type,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      seats,
      location,
      isAvailable,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query as any;

    // Build filters object for service layer
    const filters: any = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    };

    // Add optional filters only if they exist
    if (make) filters.make = make;
    if (model) filters.model = model;
    if (type) filters.type = type;
    if (transmission) filters.transmission = transmission;
    if (fuelType) filters.fuelType = fuelType;
    if (minPrice) filters.minPrice = Number(minPrice);
    if (maxPrice) filters.maxPrice = Number(maxPrice);
    if (seats) filters.seats = Number(seats);
    if (location) filters.location = location;
    if (isAvailable !== undefined) filters.isAvailable = Boolean(isAvailable);

    // Get cars from service layer
    const result = await carService.listCars(filters);

    logger.info("✅ Cars retrieved successfully", {
      traceId,
      totalFound: result.total,
      page: result.page,
      limit: result.limit,
      carsCount: result.cars.length,
    });

    // Build pagination metadata
    const pagination = {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      hasNext: result.page < result.totalPages,
      hasPrev: result.page > 1,
    };

    res.status(200).json(
      createSuccessResponse(
        "Cars retrieved successfully",
        {
          cars: result.cars,
          pagination,
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error listing cars", {
      traceId,
      query: req.query,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
