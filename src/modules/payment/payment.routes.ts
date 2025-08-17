/**
 * Payment Routes
 *
 * Defines all payment-related endpoints
 */

import { Router } from "express";
import {
  createPaymentIntent,
  getPayment,
  getPaymentsByBooking,
  handleStripeWebhook,
} from "./controllers/index.js";
// TODO: Import validation middlewares when created
// import {
//   validateCreatePaymentIntent,
//   validateGetPaymentParams,
//   validateBookingParams,
// } from "./middlewares/validation.middleware.js";

const router = Router();

// POST /payments/intent - Create payment intent for booking
router.post("/intent", /* validateCreatePaymentIntent, */ createPaymentIntent);

// GET /payments/:id - Get payment details
router.get("/:id", /* validateGetPaymentParams, */ getPayment);

// POST /payments/webhook - Stripe webhook endpoint
router.post("/webhook", handleStripeWebhook);

// GET /bookings/:bookingId/payments - Get payments for a booking
// Note: This route might be better placed in booking routes
router.get(
  "/bookings/:bookingId/payments",
  /* validateBookingParams, */ getPaymentsByBooking
);

// TODO: Implement additional routes
// POST /payments/:id/refund - Create refund
// POST /payments/:id/cancel - Cancel payment
// POST /payments/:id/retry - Retry failed payment
// GET /payments/stats - Get payment statistics

export { router as paymentRoutes };
