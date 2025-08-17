/**
 * Get Payments by Booking Controller
 *
 * Handle GET /bookings/:bookingId/payments for retrieving payments for a booking
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import { createSuccessResponse } from "../../../utils/responses.js";

/**
 * Handle getting payments for a specific booking
 * GET /bookings/:bookingId/payments
 */
export async function getPaymentsByBooking(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `get_payments_by_booking_${Date.now()}`;
  const bookingId = req.params.bookingId as string; // Validated by middleware

  try {
    logger.info("📋 Get payments by booking request started", {
      traceId,
      bookingId,
    });

    // Get payments using service layer
    const payments = await paymentService.getPaymentsByBookingId(bookingId);

    logger.info("✅ Payments retrieved successfully", {
      traceId,
      bookingId,
      paymentsCount: payments.length,
    });

    res.status(200).json(
      createSuccessResponse(
        "Payments retrieved successfully",
        {
          payments,
          count: payments.length,
          meta: {
            processedBy: "payment-service",
            version: "1.0",
            timestamp: new Date().toISOString(),
            bookingId,
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error getting payments by booking", {
      traceId,
      bookingId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
