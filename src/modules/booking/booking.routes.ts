/**
 * Booking Routes
 *
 * Defines all booking-related endpoints
 */

import { Router } from "express";
import { createBooking } from "./controllers/createBooking.controller.js";
import { validateCreateBooking } from "./middlewares/validation.middleware.js";

const router = Router();

// POST /bookings - Create new booking
router.post("/", validateCreateBooking, createBooking);

// TODO: Implement remaining routes
// GET /bookings - List user bookings
// GET /bookings/:id - Get booking details
// PUT /bookings/:id - Update booking
// DELETE /bookings/:id - Cancel booking

export { router as bookingRoutes };
