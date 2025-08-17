/**
 * Create Payment Intent Controller
 *
 * Handle POST /payments/intent for creating payment intents
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle creating a payment intent for a booking
 * POST /payments/intent
 */
export async function createPaymentIntent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `create_payment_intent_${Date.now()}`;

  try {
    logger.info("💳 Create payment intent request started", {
      traceId,
      bodyKeys: Object.keys(req.body || {}),
    });

    // Extract payment data from validated request body
    const paymentData = req.body;

    // Create payment intent using service layer
    const result = await paymentService.createPaymentIntent(paymentData);

    logger.info("✅ Payment intent created successfully", {
      traceId,
      paymentId: result.payment.id,
      stripePaymentIntentId: result.paymentIntent.id,
      bookingId: result.payment.bookingId,
      amount: result.payment.amount,
    });

    res.status(201).json(
      createSuccessResponse(
        "Payment intent created successfully",
        {
          payment: result.payment,
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
          },
        },
        traceId
      )
    );
  } catch (error) {
    logger.error("❌ Error creating payment intent", {
      traceId,
      bodyKeys: Object.keys(req.body || {}),
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
