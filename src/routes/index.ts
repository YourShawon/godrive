/**
 * Main Routes Index
 * Register all route modules here
 */

import express from "express";
import userRoutes from "../modules/user/user.routes.js";
import { authRoutes } from "../modules/auth/routes/index.js";

const router = express.Router();

// Register auth routes
router.use("/auth", authRoutes);

// Register user routes
router.use("/users", userRoutes);

export default router;
