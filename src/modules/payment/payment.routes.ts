/**
 * Payment Routes
 *
 * Defines all payment-related endpoints with validation
 */

import { Router } from "express";
import {
  createPaymentIntent,
  getPayment,
  getPaymentsByBooking,
  handleStripeWebhook,
  createRefund,
  cancelPayment,
  retryPayment,
  getPaymentStats,
} from "./controllers/index.js";
import {
  validateCreatePaymentIntent,
  validateGetPayment,
  validateGetPaymentsByBooking,
  validateWebhookSignature,
  validateCreateRefund,
  validateCancelPayment,
  validateRetryPayment,
  validatePaymentStats,
} from "./middleware/validation.middleware.js";

const router = Router();

// POST /payments/intent - Create payment intent for booking
router.post("/intent", validateCreatePaymentIntent, createPaymentIntent);

// GET /payments/stats - Get payment statistics (before :id route to avoid conflicts)
router.get("/stats", validatePaymentStats, getPaymentStats);

// GET /payments/:id - Get payment details
router.get("/:id", validateGetPayment, getPayment);

// POST /payments/webhook - Stripe webhook endpoint
router.post("/webhook", validateWebhookSignature, handleStripeWebhook);

// POST /payments/:id/refund - Create refund
router.post("/:id/refund", validateCreateRefund, createRefund);

// POST /payments/:id/cancel - Cancel payment
router.post("/:id/cancel", validateCancelPayment, cancelPayment);

// POST /payments/:id/retry - Retry failed payment
router.post("/:id/retry", validateRetryPayment, retryPayment);

// GET /bookings/:bookingId/payments - Get payments for a booking
// Note: This route might be better placed in booking routes
router.get(
  "/bookings/:bookingId/payments",
  validateGetPaymentsByBooking,
  getPaymentsByBooking
);

export { router as paymentRoutes };
