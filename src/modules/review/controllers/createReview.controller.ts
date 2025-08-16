/**
 * Create Review Controller
 *
 * Handles HTTP requests for creating new reviews
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { reviewService } from "../services/review.service.js";
import { CreateReviewBody } from "../schemas/createReview.schemas.js";

/**
 * Interface for authenticated request (will be enhanced when auth is implemented)
 * For now, we'll simulate a userId in the request
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  body: CreateReviewBody;
}

/**
 * Create a new review
 *
 * @route POST /api/v1/reviews
 * @access Private (requires authentication - to be implemented)
 * @param req - Express request object with review data
 * @param res - Express response object
 * @param next - Express next function
 */
export async function createReview(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `create_review_${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    logger.info("🎯 CreateReview: Starting review creation", {
      traceId,
      body: req.body,
      // TODO: Add userId when auth is implemented
      // userId: req.user?.id,
    });

    const { carId, rating, title, comment } = req.body;

    // TODO: Get userId from authenticated user
    // For now, we'll use a placeholder - this will be replaced with actual auth
    const userId = req.user?.id || "placeholder_user_id";

    if (userId === "placeholder_user_id") {
      logger.warn(
        "⚠️ CreateReview: Using placeholder user ID - auth not implemented yet",
        {
          traceId,
        }
      );
    }

    // Validate that required data is present
    if (!carId || !rating || !title) {
      logger.warn("⚠️ CreateReview: Missing required fields", {
        traceId,
        providedFields: { carId: !!carId, rating: !!rating, title: !!title },
      });

      res
        .status(400)
        .json(
          createErrorResponse(
            "Missing required fields: carId, rating, and title are required",
            "VALIDATION_ERROR",
            { traceId }
          )
        );
      return;
    }

    // Create review using service layer
    logger.info("📝 CreateReview: Calling review service", {
      traceId,
      carId,
      userId,
      rating,
    });

    const newReview = await reviewService.createReview({
      carId,
      userId,
      rating,
      title,
      comment: comment || "", // Ensure comment is always a string
    });

    logger.info("✅ CreateReview: Review created successfully", {
      traceId,
      reviewId: newReview.id,
      carId: newReview.carId,
      userId: newReview.userId,
      rating: newReview.rating,
    });

    // Return success response with created review
    res.status(201).json(
      createSuccessResponse("Review created successfully", newReview, traceId, {
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    logger.error("❌ CreateReview: Error creating review", {
      traceId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body,
    });

    // Handle specific error types
    if (error instanceof Error) {
      // Car not found error
      if (
        error.message.includes("Car not found") ||
        error.message.includes("car does not exist")
      ) {
        res
          .status(404)
          .json(
            createErrorResponse("Car not found", "CAR_NOT_FOUND", { traceId })
          );
        return;
      }

      // Duplicate review error
      if (
        error.message.includes("already reviewed") ||
        error.message.includes("duplicate")
      ) {
        res
          .status(409)
          .json(
            createErrorResponse(
              "You have already reviewed this car",
              "DUPLICATE_REVIEW",
              { traceId }
            )
          );
        return;
      }

      // Validation error
      if (
        error.message.includes("validation") ||
        error.message.includes("invalid")
      ) {
        res
          .status(400)
          .json(
            createErrorResponse(error.message, "VALIDATION_ERROR", { traceId })
          );
        return;
      }
    }

    // Generic server error
    res
      .status(500)
      .json(
        createErrorResponse(
          "An error occurred while creating the review",
          "INTERNAL_SERVER_ERROR",
          { traceId }
        )
      );

    // Pass error to error handling middleware
    next(error);
  }
}

/**
 * Example usage documentation
 *
 * POST /api/v1/reviews
 * Content-Type: application/json
 * Authorization: Bearer <jwt_token> (to be implemented)
 *
 * {
 *   "carId": "507f1f77bcf86cd799439011",
 *   "rating": 5,
 *   "title": "Excellent car!",
 *   "comment": "Had a great experience with this rental."
 * }
 *
 * Response (201 Created):
 * {
 *   "status": "success",
 *   "message": "Review created successfully",
 *   "data": {
 *     "id": "507f1f77bcf86cd799439012",
 *     "carId": "507f1f77bcf86cd799439011",
 *     "userId": "507f1f77bcf86cd799439013",
 *     "rating": 5,
 *     "title": "Excellent car!",
 *     "comment": "Had a great experience with this rental.",
 *     "createdAt": "2025-08-16T10:30:00.000Z",
 *     "updatedAt": "2025-08-16T10:30:00.000Z"
 *   },
 *   "meta": {
 *     "timestamp": "2025-08-16T10:30:00.000Z",
 *     "traceId": "create_review_1692187800123"
 *   }
 * }
 */
