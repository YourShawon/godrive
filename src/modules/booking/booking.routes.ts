/**
 * Booking Routes
 *
 * Defines all booking-related endpoints
 */

import { Router } from "express";
import { createBooking } from "./controllers/createBooking.controller.js";
import { getBooking } from "./controllers/getBooking.controller.js";
import { listBookings } from "./controllers/listBookings.controller.js";
import {
  validateCreateBooking,
  validateGetBookingParams,
  validateListBookingsQuery,
} from "./middlewares/validation.middleware.js";

const router = Router();

// GET /bookings - List user bookings with pagination and filtering
router.get("/", validateListBookingsQuery, listBookings);

// POST /bookings - Create new booking
router.post("/", validateCreateBooking, createBooking);

// GET /bookings/:id - Get booking details
router.get("/:id", validateGetBookingParams, getBooking);

// TODO: Implement remaining routes
// PUT /bookings/:id - Update booking
// DELETE /bookings/:id - Cancel booking

export { router as bookingRoutes };
