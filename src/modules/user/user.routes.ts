// User Routes - HTTP endpoints for user operations

import express from "express";
import { validateRequest } from "../../middlewares/validation.js";
import { userValidation } from "../../schemas/user.schemas.js";
import { getUserById } from "./controllers/getUserById.controller.js";

const router = express.Router();

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Public (for now)
 * @validation MongoDB ObjectId format required
 */
router.get(
  "/:id",
  validateRequest(userValidation.getUser), // Validates MongoDB ObjectId
  getUserById // Clean function reference
);

export default router;
