/**
 * Stripe Webhook Controller
 *
 * Handle POST /payments/webhook for Stripe webhook events
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import { stripeService } from "../services/stripe.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle Stripe webhook events
 * POST /payments/webhook
 */
export async function handleStripeWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `stripe_webhook_${Date.now()}`;

  try {
    logger.info("🔔 Stripe webhook request started", {
      traceId,
      hasBody: !!req.body,
      hasSignature: !!req.headers["stripe-signature"],
    });

    // Get raw body and signature
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = req.body; // Should be raw string for webhook verification

    if (!signature) {
      logger.error("❌ Missing Stripe signature", { traceId });

      res
        .status(400)
        .json(
          createErrorResponse(
            "Missing Stripe signature",
            "MISSING_SIGNATURE",
            {},
            traceId
          )
        );
      return;
    }

    // Verify webhook signature and parse event
    const event = stripeService.verifyWebhookSignature(rawBody, signature);

    logger.info("✅ Webhook signature verified", {
      traceId,
      eventType: event.type,
      eventId: event.id,
    });

    // Process the webhook event
    await paymentService.processStripeWebhook(event);

    logger.info("✅ Webhook processed successfully", {
      traceId,
      eventType: event.type,
      eventId: event.id,
    });

    // Stripe expects a 200 response to acknowledge webhook receipt
    res.status(200).json(
      createSuccessResponse(
        "Webhook processed successfully",
        {
          eventId: event.id,
          eventType: event.type,
          processed: true,
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
    logger.error("❌ Error processing Stripe webhook", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // For webhook errors, we still want to return 200 to prevent retries
    // unless it's a signature verification error
    if (error instanceof Error && error.message.includes("signature")) {
      res
        .status(400)
        .json(
          createErrorResponse(
            "Invalid webhook signature",
            "INVALID_SIGNATURE",
            {},
            traceId
          )
        );
    } else {
      // Log error but return 200 to prevent Stripe retries
      res.status(200).json(
        createSuccessResponse(
          "Webhook received but processing failed",
          {
            processed: false,
            error: error instanceof Error ? error.message : "Unknown error",
          },
          traceId
        )
      );
    }
  }
}
