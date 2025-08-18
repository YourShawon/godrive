/**
 * Cancel Payment Controller
 *
 * Handle POST /payments/:id/cancel for canceling payments
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle canceling a payment
 * POST /payments/:id/cancel
 */
export async function cancelPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `cancel_payment_${Date.now()}`;
  const paymentId = req.params.id as string;

  try {
    logger.info("🚫 Cancel payment request started", {
      traceId,
      paymentId,
    });

    // Cancel payment using service layer
    const result = await paymentService.cancelPayment(paymentId);

    if (!result) {
      logger.warn("⚠️ Payment not found for cancellation", {
        traceId,
        paymentId,
      });

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

    logger.info("✅ Payment canceled successfully", {
      traceId,
      paymentId: result.id,
      newStatus: result.status,
    });

    res.status(200).json(
      createSuccessResponse(
        "Payment canceled successfully",
        {
          payment: result,
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
    logger.error("❌ Error canceling payment", {
      traceId,
      paymentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
