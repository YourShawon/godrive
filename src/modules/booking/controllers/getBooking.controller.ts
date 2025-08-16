/**
 * Get Booking Controller
 *
 * Handles retrieval of a single booking by ID
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { bookingService } from "../services/booking.service.js";
import { GetBookingParams } from "../schemas/getBooking.schema.js";

/**
 * Get a booking by ID
 *
 * @route GET /api/v1/bookings/:id
 * @access Private (requires authentication)
 * @middleware validateGetBookingParams - Validates booking ID parameter
 */
export async function getBooking(
  req: Request<GetBookingParams>,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `get_booking_${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    logger.info("🔍 GetBooking: Starting booking retrieval", {
      traceId,
      bookingId: req.params.id,
    });

    // Get validated booking ID from params (validated by middleware)
    const { id } = req.params;

    // TODO: Add user authorization - ensure user can only access their own bookings

    // Get booking via service
    const booking = await bookingService.getBookingById(id);

    if (!booking) {
      logger.warn("⚠️ GetBooking: Booking not found", {
        traceId,
        bookingId: id,
      });

      res
        .status(404)
        .json(
          createErrorResponse(
            "Booking not found",
            "BOOKING_NOT_FOUND",
            undefined,
            traceId
          )
        );
      return;
    }

    logger.info("✅ GetBooking: Booking retrieved successfully", {
      traceId,
      bookingId: booking.id,
    });

    res
      .status(200)
      .json(
        createSuccessResponse(
          "Booking retrieved successfully",
          booking,
          traceId
        )
      );
  } catch (error) {
    logger.error("❌ GetBooking: Error retrieving booking", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    res
      .status(500)
      .json(
        createErrorResponse(
          "An error occurred while retrieving the booking",
          "INTERNAL_SERVER_ERROR",
          undefined,
          traceId
        )
      );

    next(error);
  }
}
