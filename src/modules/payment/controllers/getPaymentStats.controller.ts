/**
 * Payment Statistics Controller
 *
 * Handle GET /payments/stats for payment statistics
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import { paymentService } from "../services/payment.service.js";
import { createSuccessResponse } from "../../../utils/responses.js";

/**
 * Handle getting payment statistics
 * GET /payments/stats?startDate=...&endDate=...
 */
export async function getPaymentStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = req.traceId || `get_payment_stats_${Date.now()}`;

  try {
    logger.info("📊 Get payment statistics request started", {
      traceId,
      query: req.query,
    });

    // Extract date range from query parameters
    const startDate = new Date(req.query.startDate as string);
    const endDate = new Date(req.query.endDate as string);

    // Get statistics using service layer
    const stats = await paymentService.getPaymentStats(startDate, endDate);

    logger.info("✅ Payment statistics retrieved successfully", {
      traceId,
      startDate,
      endDate,
      totalPayments: stats.totalPayments,
      totalAmount: stats.totalAmount,
    });

    res.status(200).json(
      createSuccessResponse(
        "Payment statistics retrieved successfully",
        {
          statistics: {
            ...stats,
            successRate:
              stats.totalPayments > 0
                ? (
                    (stats.successfulPayments / stats.totalPayments) *
                    100
                  ).toFixed(2) + "%"
                : "0%",
            failureRate:
              stats.totalPayments > 0
                ? ((stats.failedPayments / stats.totalPayments) * 100).toFixed(
                    2
                  ) + "%"
                : "0%",
          },
          dateRange: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            daysInRange: Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            ),
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
    logger.error("❌ Error getting payment statistics", {
      traceId,
      query: req.query,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(error);
  }
}
