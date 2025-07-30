/**
 * Main Routes Index
 * Register all route modules here
 */

import express from "express";
import userRoutes from "../modules/user/user.routes.js";

const router = express.Router();

// Register user routes
router.use("/users", userRoutes);

export default router;
