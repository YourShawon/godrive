// User Routes - HTTP endpoints for user operations

import express from "express";
import { validateRequest } from "../../middlewares/validation.js";
import { userValidation } from "../../schemas/user.schemas.js";
import { getUserById } from "./controllers/getUserById.controller.js";
import { createUser } from "./controllers/createUser.controller.js";

const router = express.Router();

/**
 * @route   POST /api/v1/users
 * @desc    Create a new user
 * @access  Public (for now)
 * @validation Create user data validation
 */
router.post(
  "/",
  // validateRequest(userValidation.createUser), // We'll add this validation next
  createUser // Clean function reference
);

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
