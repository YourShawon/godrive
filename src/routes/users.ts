/**
 * User Routes - Starting Simple
 * Just one route: GET /users/:id
 */

import express from "express";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../utils/responses.js";
import { getUserById } from "../database/mockUsers.js";

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public (for now)
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const traceId = req.traceId;

  try {
    console.log(`🔍 Fetching user with ID: ${id}`);

    const user = await getUserById(id);

    if (!user) {
      return res
        .status(404)
        .json(
          createErrorResponse(
            "User not found",
            "NOT_FOUND",
            { userId: id },
            traceId
          )
        );
    }

    console.log(`✅ User found: ${user.firstName} ${user.lastName}`);

    return res.json(
      createSuccessResponse("User retrieved successfully", { user }, traceId)
    );
  } catch (error) {
    console.error(`❌ Error fetching user ${id}:`, error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return res
      .status(500)
      .json(
        createErrorResponse(
          "Failed to retrieve user",
          "INTERNAL_ERROR",
          { userId: id, details: errorMessage },
          traceId
        )
      );
  }
});

export default router;
