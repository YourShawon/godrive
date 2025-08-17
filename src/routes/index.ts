/**
 * Main Routes Index
 * Register all route modules here
 */

import express from "express";
import userRoutes from "../modules/user/user.routes.js";
import { authRoutes } from "../modules/auth/routes/index.js";
import carRoutes from "../modules/car/car.routes.js";
import { reviewRoutes } from "../modules/review/review.routes.js";
import { bookingRoutes } from "../modules/booking/booking.routes.js";
import { paymentRoutes } from "../modules/payment/payment.routes.js";

const router = express.Router();

// Register auth routes
router.use("/auth", authRoutes);

// Register user routes
router.use("/users", userRoutes);

// Register car routes
router.use("/cars", carRoutes);

// Register reviews routes
router.use("/reviews", reviewRoutes);

// Register booking routes
router.use("/bookings", bookingRoutes);

// Register payment routes
router.use("/payments", paymentRoutes);

export default router;
