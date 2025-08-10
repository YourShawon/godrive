/**
 * Review Routes
 *
 * Defines all review-related endpoints
 */

import { Router } from "express";
import { listReviews } from "./controllers/listReviews.controller.js";
import { logger } from "../../utils/logger/config.js";

const router = Router();

// Log route registration
logger.info("🛣️ Setting up review routes");

/**
 * @route GET /reviews
 * @desc Get paginated list of reviews with filtering and sorting
 * @access Public
 */
router.get("/", listReviews);

/**
 * @route GET /reviews/:id
 * @desc Get a specific review by ID
 * @access Public
 */
// TODO: Implement getReviewController

/**
 * @route POST /reviews
 * @desc Create a new review
 * @access Private (requires authentication)
 */
// TODO: Implement createReviewController

/**
 * @route PUT /reviews/:id
 * @desc Update an existing review
 * @access Private (requires authentication and ownership)
 */
// TODO: Implement updateReviewController

/**
 * @route DELETE /reviews/:id
 * @desc Delete a review
 * @access Private (requires authentication and ownership)
 */
// TODO: Implement deleteReviewController

/**
 * @route GET /reviews/stats/car/:carId
 * @desc Get review statistics for a specific car
 * @access Public
 */
// TODO: Implement getCarStatsController

/**
 * @route GET /reviews/stats/user/:userId
 * @desc Get review statistics for a specific user
 * @access Public
 */
// TODO: Implement getUserStatsController

/**
 * @route GET /reviews/stats/global
 * @desc Get global review statistics
 * @access Public
 */
// TODO: Implement getGlobalStatsController

logger.info("✅ Review routes configured successfully");

export { router as reviewRoutes };
