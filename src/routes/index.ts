/**
 * Main Routes Index
 * Register all route modules here
 */

import express from "express";
import userRoutes from "../modules/user/user.routes.js";
import { authRoutes } from "../modules/auth/routes/index.js";
import carRoutes from "../modules/car/car.routes.js";

const router = express.Router();

// Register auth routes
router.use("/auth", authRoutes);

// Register user routes
router.use("/users", userRoutes);

// Register car routes
router.use("/cars", carRoutes);

export default router;
