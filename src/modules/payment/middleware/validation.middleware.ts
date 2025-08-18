/**
 * Payment Validation Middleware
 *
 * Validation middleware for payment-related endpoints
 */

import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { logger } from "../../../utils/logger/config.js";
import { createErrorResponse } from "../../../utils/responses.js";
import { Currency, PaymentMethod } from "../types/index.js";

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const traceId = req.traceId || `validation_error_${Date.now()}`;

    logger.warn("⚠️ Validation errors in request", {
      traceId,
      path: req.path,
      method: req.method,
      errors: errors.array(),
    });

    res.status(400).json(
      createErrorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        {
          errors: errors.array(),
        },
        traceId
      )
    );
    return;
  }

  next();
};

/**
 * Validate create payment intent request
 */
export const validateCreatePaymentIntent = [
  body("bookingId")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("bookingId must be a valid 24-character MongoDB ObjectId"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("amount must be a positive number greater than 0"),

  body("currency")
    .isString()
    .isIn(Object.values(Currency))
    .withMessage(
      `currency must be one of: ${Object.values(Currency).join(", ")}`
    ),

  body("paymentMethod")
    .optional()
    .isString()
    .isIn(Object.values(PaymentMethod))
    .withMessage(
      `paymentMethod must be one of: ${Object.values(PaymentMethod).join(", ")}`
    ),

  body("customerEmail")
    .optional()
    .isEmail()
    .withMessage("customerEmail must be a valid email address"),

  body("customerName")
    .optional()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage("customerName must be between 1 and 100 characters"),

  body("metadata")
    .optional()
    .isObject()
    .withMessage("metadata must be a valid object"),

  handleValidationErrors,
];

/**
 * Validate get payment request
 */
export const validateGetPayment = [
  param("id")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("Payment ID must be a valid 24-character MongoDB ObjectId"),

  handleValidationErrors,
];

/**
 * Validate get payments by booking request
 */
export const validateGetPaymentsByBooking = [
  param("bookingId")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("Booking ID must be a valid 24-character MongoDB ObjectId"),

  handleValidationErrors,
];

/**
 * Validate refund request
 */
export const validateCreateRefund = [
  param("id")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("Payment ID must be a valid 24-character MongoDB ObjectId"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("refund amount must be a positive number greater than 0"),

  body("reason")
    .optional()
    .isString()
    .isIn(["duplicate", "fraudulent", "requested_by_customer"])
    .withMessage(
      "reason must be one of: duplicate, fraudulent, requested_by_customer"
    ),

  body("metadata")
    .optional()
    .isObject()
    .withMessage("metadata must be a valid object"),

  handleValidationErrors,
];

/**
 * Validate cancel payment request
 */
export const validateCancelPayment = [
  param("id")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("Payment ID must be a valid 24-character MongoDB ObjectId"),

  handleValidationErrors,
];

/**
 * Validate retry payment request
 */
export const validateRetryPayment = [
  param("id")
    .isString()
    .notEmpty()
    .isLength({ min: 24, max: 24 })
    .withMessage("Payment ID must be a valid 24-character MongoDB ObjectId"),

  handleValidationErrors,
];

/**
 * Validate webhook signature
 */
export const validateWebhookSignature = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const signature = req.headers["stripe-signature"] as string;
  const traceId = req.traceId || `webhook_validation_${Date.now()}`;

  if (!signature) {
    logger.warn("⚠️ Missing Stripe webhook signature", {
      traceId,
      headers: Object.keys(req.headers),
    });

    res
      .status(400)
      .json(
        createErrorResponse(
          "Missing Stripe signature header",
          "MISSING_SIGNATURE",
          {},
          traceId
        )
      );
    return;
  }

  // Add signature to request for controller access
  req.webhookSignature = signature;
  next();
};

/**
 * Validate payment statistics request
 */
export const validatePaymentStats = [
  query("startDate")
    .isISO8601()
    .withMessage("startDate must be a valid ISO 8601 date"),

  query("endDate")
    .isISO8601()
    .withMessage("endDate must be a valid ISO 8601 date")
    .custom((endDate: string, { req }: { req: any }) => {
      const startDate = new Date(req.query.startDate as string);
      const end = new Date(endDate);

      if (end <= startDate) {
        throw new Error("endDate must be after startDate");
      }

      return true;
    }),
  handleValidationErrors,
];

// Extend Express Request interface for custom properties
declare global {
  namespace Express {
    interface Request {
      webhookSignature?: string;
    }
  }
}
