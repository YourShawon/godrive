/**
 * List Bookings Controller
 *
 * Handles listing bookings with pagination and filtering
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { bookingService } from "../services/booking.service.js";
import { ListBookingsQuery } from "../schemas/listBookings.schema.js";
import { BookingStatus } from "../types/index.js";

interface ListBookingsFilters {
  userId?: string;
  carId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * List bookings with pagination and filtering
 *
 * @route GET /api/v1/bookings
 * @access Private (requires authentication)
 * @middleware validateListBookingsQuery - Validates query parameters
 */
export async function listBookings(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `list_bookings_${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    logger.info("📋 ListBookings: Starting bookings listing", {
      traceId,
      query: req.query,
    });

    // Get validated query parameters (validated by middleware)
    const validatedQuery = (req as any).validatedQuery as ListBookingsQuery;

    // TODO: Add user authorization - filter by authenticated user's bookings
    // For now, we'll use a placeholder userId
    const userId = "507f1f77bcf86cd799439011"; // Will be from auth middleware

    // Prepare filters for service (properly typed)
    const filters: ListBookingsFilters = {
      page: validatedQuery.page,
      limit: validatedQuery.limit,
      sortBy: validatedQuery.sortBy,
      sortOrder: validatedQuery.sortOrder,
    };

    // Add optional filters only if they exist
    if (userId) filters.userId = userId;
    if (validatedQuery.carId) filters.carId = validatedQuery.carId;
    if (validatedQuery.status) filters.status = validatedQuery.status;
    if (validatedQuery.startDate) filters.startDate = validatedQuery.startDate;
    if (validatedQuery.endDate) filters.endDate = validatedQuery.endDate;

    // Get bookings via service
    const result = await bookingService.listBookings(filters);

    logger.info("✅ ListBookings: Bookings listed successfully", {
      traceId,
      count: result.bookings.length,
      total: result.total,
      page: result.page,
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
        "Bookings retrieved successfully",
        {
          bookings: result.bookings,
          pagination,
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ ListBookings: Error listing bookings", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res
      .status(500)
      .json(
        createErrorResponse(
          "An error occurred while retrieving bookings",
          "INTERNAL_SERVER_ERROR",
          undefined,
          traceId
        )
      );

    next(error);
  }
}
