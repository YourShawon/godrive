/**
 * Retry Payment Controller
 *
 * Handle POST /payments/:id/retry for retrying failed payments
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle retrying a failed payment
 * POST /payments/:id/retry
 */
export async function retryPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `retry_payment_${Date.now()}`;
  const originalPaymentId = req.params.id as string;

  try {
    logger.info("🔄 Retry payment request started", {
      traceId,
      originalPaymentId,
    });

    // Retry payment using service layer
    const result = await paymentService.retryPayment(originalPaymentId);

    logger.info("✅ Payment retry initiated successfully", {
      traceId,
      originalPaymentId,
      newPaymentId: result.payment.id,
      newPaymentIntentId: result.paymentIntent.id,
    });

    res.status(201).json(
      createSuccessResponse(
        "Payment retry initiated successfully",
        {
          originalPaymentId,
          newPayment: result.payment,
          paymentIntent: {
            id: result.paymentIntent.id,
            clientSecret: result.paymentIntent.clientSecret,
            amount: result.paymentIntent.amount,
            currency: result.paymentIntent.currency,
            status: result.paymentIntent.status,
          },
          meta: {
            processedBy: "payment-service",
            version: "1.0",
            timestamp: new Date().toISOString(),
            isRetry: true,
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error retrying payment", {
      traceId,
      originalPaymentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
