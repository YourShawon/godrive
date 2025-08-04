/**
 * List Cars Controller
 *
 * Handle GET /cars with pagination, filtering, and sorting
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "@utils/logger/config.js";
import { carRepository } from "../repositories/car.repository.js";
import {
  createSuccessResponse,
  createPaginatedResponse,
} from "../../../utils/responses.js";

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
      type,
      transmission,
      fuelType,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      location,
      isAvailable,
      sort = "createdAt",
      order = "desc",
      search,
    } = req.query as {
      page?: number;
      limit?: number;
      make?: string;
      type?: string;
      transmission?: string;
      fuelType?: string;
      minPrice?: number;
      maxPrice?: number;
      minYear?: number;
      maxYear?: number;
      location?: string;
      isAvailable?: boolean;
      sort?: string;
      order?: "asc" | "desc";
      search?: string;
    };

    // Build filters object
    const filters = {
      ...(make && { make }),
      ...(type && { type }),
      ...(transmission && { transmission }),
      ...(fuelType && { fuelType }),
      ...(location && { location }),
      ...(isAvailable !== undefined && { isAvailable }),
      ...(minPrice && { pricePerDay: { gte: minPrice } }),
      ...(maxPrice && {
        pricePerDay: {
          ...(minPrice ? { gte: minPrice } : {}),
          lte: maxPrice,
        },
      }),
      ...(minYear && { minYear }),
      ...(maxYear && { maxYear }),
      ...(search && { search }),
    };

    // Get cars from repository
    const result = await carRepository.findMany({
      filters,
      pagination: { page, limit },
      sort: { field: sort, order },
    });

    logger.info("✅ Cars retrieved successfully", {
      traceId,
      totalFound: result.total,
      page,
      limit,
      filtersApplied: Object.keys(filters).length,
    });

    // Use paginated response helper
    res.status(200).json(
      createPaginatedResponse(
        "Cars retrieved successfully",
        result.cars,
        {
          page,
          limit,
          total: result.total,
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
