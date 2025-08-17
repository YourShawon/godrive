/**
 * Get Payment Controller
 *
 * Handle GET /payments/:id for retrieving payment details
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle getting payment details
 * GET /payments/:id
 */
export async function getPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `get_payment_${Date.now()}`;
  const paymentId = req.params.id as string; // Validated by middleware

  try {
    logger.info("🔍 Get payment request started", {
      traceId,
      paymentId,
    });

    // Get payment using service layer
    const payment = await paymentService.getPaymentById(paymentId);

    if (!payment) {
      logger.warn("⚠️ Payment not found", { traceId, paymentId });

      res
        .status(404)
        .json(
          createErrorResponse(
            "Payment not found",
            "PAYMENT_NOT_FOUND",
            { paymentId },
            traceId
          )
        );
      return;
    }

    logger.info("✅ Payment retrieved successfully", {
      traceId,
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      bookingId: payment.bookingId,
    });

    res.status(200).json(
      createSuccessResponse(
        "Payment retrieved successfully",
        {
          payment,
          meta: {
            processedBy: "payment-service",
            version: "1.0",
            timestamp: new Date().toISOString(),
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error getting payment", {
      traceId,
      paymentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
