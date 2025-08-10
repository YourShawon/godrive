import { logger } from "@utils/logger/config.js";
import {
  createPaginatedResponse,
  createErrorResponse,
} from "@utils/responses.js";
import { Request, Response, NextFunction } from "express";
import { reviewService } from "../services/review.service.js";

export async function listReviews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `list_reviews_${Date.now()}`;

  try {
    logger.info("📝 List reviews request started", {
      traceId,
      query: req.query,
    });

    // Extract and validate query parameters (validated by middleware)
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      carId,
      userId,
      rating,
      minRating,
      maxRating,
      search,
      verified,
      startDate,
      endDate,
      minHelpful,
      includeCar = false,
      includeUser = false,
    } = req.query as {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      carId?: string;
      userId?: string;
      rating?: string;
      minRating?: number;
      maxRating?: number;
      search?: string;
      verified?: boolean;
      startDate?: string;
      endDate?: string;
      minHelpful?: number;
      includeCar?: boolean;
      includeUser?: boolean;
    };

    // Build filters object
    const filters: any = {};

    if (carId) filters.carId = carId;
    if (userId) filters.userId = userId;
    if (rating) filters.rating = rating;
    if (minRating !== undefined) filters.minRating = minRating;
    if (maxRating !== undefined) filters.maxRating = maxRating;
    if (search) filters.search = search;
    if (verified !== undefined) filters.verified = verified;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (minHelpful !== undefined) filters.minHelpful = minHelpful;

    // Call service to get reviews
    const result = await reviewService.getReviews({
      filters,
      pagination: { page, limit },
      sort: { field: sortBy, order: sortOrder },
      include: { car: includeCar, user: includeUser },
    });

    logger.info("✅ Reviews retrieved successfully", {
      traceId,
      totalFound: result.total,
      returnedCount: result.reviews.length,
      page: result.page,
      totalPages: result.totalPages,
    });

    // Use paginated response
    res.status(200).json(
      createPaginatedResponse(
        "Reviews retrieved successfully",
        result.reviews,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error retrieving reviews", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      query: req.query,
    });

    res.status(500).json(
      createErrorResponse(
        "Failed to retrieve reviews",
        "INTERNAL_SERVER_ERROR",
        {
          traceId,
          timestamp: new Date().toISOString(),
        }
      )
    );

    next(error);
  }
}
