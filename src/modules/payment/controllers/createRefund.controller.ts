/**
 * Refund Payment Controller
 *
 * Handle POST /payments/:id/refund for creating refunds
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";

/**
 * Handle creating a refund for a payment
 * POST /payments/:id/refund
 */
export async function createRefund(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `create_refund_${Date.now()}`;
  const paymentId = req.params.id as string;

  try {
    logger.info("💰 Create refund request started", {
      traceId,
      paymentId,
      refundData: req.body,
    });

    // Extract refund data from request body
    const { amount, reason, metadata } = req.body;

    const refundData = {
      paymentId,
      amount,
      reason,
      metadata,
    };

    // Create refund using service layer
    const result = await paymentService.createRefund(refundData);

    logger.info("✅ Refund created successfully", {
      traceId,
      paymentId,
      refundId: result.refundId,
      refundAmount: result.amount,
    });

    res.status(201).json(
      createSuccessResponse(
        "Refund created successfully",
        {
          refund: {
            id: result.refundId,
            paymentId,
            amount: result.amount,
            status: "succeeded",
            created: new Date(),
          },
          payment: result.payment,
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
    logger.error("❌ Error creating refund", {
      traceId,
      paymentId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
