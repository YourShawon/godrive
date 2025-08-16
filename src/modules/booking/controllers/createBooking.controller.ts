/**
 * Create Booking Controller
 *
 * Handles booking creation requests
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { bookingService } from "../services/booking.service.js";

/**
 * Create a new booking
 *
 * @route POST /api/v1/bookings
 * @access Private (requires authentication)
 */
export async function createBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `create_booking_${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    logger.info("🎯 CreateBooking: Starting booking creation", {
      traceId,
      body: req.body,
    });

    const { carId, startDate, endDate, notes } = req.body;

    // TODO: Get userId from authenticated user
    const userId = "507f1f77bcf86cd799439011"; // Valid ObjectId placeholder - will be from auth middleware

    // Convert string dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Create booking via service
    try {
      const booking = await bookingService.createBooking({
        userId,
        carId,
        startDate: startDateObj,
        endDate: endDateObj,
        notes,
      });

      logger.info("✅ CreateBooking: Booking created successfully", {
        traceId,
        bookingId: booking.id,
      });

      res
        .status(201)
        .json(
          createSuccessResponse(
            "Booking created successfully",
            booking,
            traceId
          )
        );
    } catch (serviceError) {
      console.error("SERVICE ERROR:", serviceError);
      throw serviceError; // Re-throw to be caught by outer try-catch
    }
  } catch (error) {
    logger.error("❌ CreateBooking: Error creating booking", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    });

    console.error("BOOKING ERROR DETAILS:", error); // Temporary debug log

    res
      .status(500)
      .json(
        createErrorResponse(
          "An error occurred while creating the booking",
          "INTERNAL_SERVER_ERROR",
          traceId
        )
      );

    next(error);
  }
}
