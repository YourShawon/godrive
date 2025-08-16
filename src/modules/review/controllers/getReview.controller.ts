/**
 * Get Review Controller
 *
 * Handles HTTP requests for retrieving a single review by ID
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../../../utils/logger/config.js";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../../utils/responses.js";
import { reviewService } from "../services/review.service.js";
import {
  GetReviewParams,
  GetReviewQuery,
} from "../schemas/getReview.schemas.js";

/**
 * Interface for get review request
 */
interface GetReviewRequest extends Request {
  params: GetReviewParams;
  query: GetReviewQuery;
}

/**
 * Get a single review by ID
 *
 * @route GET /api/v1/reviews/:id
 * @access Public
 * @param req - Express request object with review ID and optional includes
 * @param res - Express response object
 * @param next - Express next function
 */
export async function getReview(
  req: GetReviewRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const traceId = `get_review_${Date.now()}${Math.floor(Math.random() * 1000)}`;

  try {
    const { id } = req.params;
    const { include } = req.query;

    logger.info("🔍 GetReview: Starting review retrieval", {
      traceId,
      reviewId: id,
      include,
    });

    // Parse include parameter
    let includeOptions = { car: false, user: false };
    if (include) {
      const includes = include.split(",").map((s) => s.trim());
      includeOptions = {
        car: includes.includes("car"),
        user: includes.includes("user"),
      };
    }

    logger.info("📄 GetReview: Calling review service", {
      traceId,
      reviewId: id,
      includeOptions,
    });

    // Get review from service
    const review = await reviewService.getReviewById(id, includeOptions);

    if (!review) {
      logger.warn("⚠️ GetReview: Review not found", {
        traceId,
        reviewId: id,
      });

      res
        .status(404)
        .json(
          createErrorResponse("Review not found", "REVIEW_NOT_FOUND", traceId)
        );
      return;
    }

    logger.info("✅ GetReview: Review retrieved successfully", {
      traceId,
      reviewId: review.id,
      carId: review.carId,
      userId: review.userId,
      rating: review.rating,
      hasCarData: !!review.car,
      hasUserData: !!review.user,
    });

    // Return success response with review data
    res
      .status(200)
      .json(
        createSuccessResponse("Review retrieved successfully", review, traceId)
      );
  } catch (error) {
    logger.error("❌ GetReview: Error retrieving review", {
      traceId,
      reviewId: req.params.id,
      include: req.query.include,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Handle specific error types
    if (error instanceof Error) {
      // Invalid ObjectId format (should be caught by validation, but just in case)
      if (
        error.message.includes("ObjectId") ||
        error.message.includes("invalid")
      ) {
        res
          .status(400)
          .json(
            createErrorResponse(
              "Invalid review ID format",
              "INVALID_ID_FORMAT",
              traceId
            )
          );
        return;
      }

      // Database connection errors
      if (
        error.message.includes("connection") ||
        error.message.includes("database")
      ) {
        res
          .status(503)
          .json(
            createErrorResponse(
              "Database temporarily unavailable",
              "DATABASE_UNAVAILABLE",
              traceId
            )
          );
        return;
      }
    }

    // Generic server error
    res
      .status(500)
      .json(
        createErrorResponse(
          "An error occurred while retrieving the review",
          "INTERNAL_SERVER_ERROR",
          traceId
        )
      );

    // Pass error to error handling middleware
    next(error);
  }
}

/**
 * Example usage documentation
 *
 * GET /api/v1/reviews/507f1f77bcf86cd799439011
 *
 * Response (200 OK):
 * {
 *   "status": "success",
 *   "message": "Review retrieved successfully",
 *   "data": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "carId": "507f1f77bcf86cd799439012",
 *     "userId": "507f1f77bcf86cd799439013",
 *     "rating": 5,
 *     "title": "Excellent car!",
 *     "comment": "Had a great experience with this rental.",
 *     "createdAt": "2025-08-16T10:30:00.000Z",
 *     "updatedAt": "2025-08-16T10:30:00.000Z"
 *   },
 *   "meta": {
 *     "timestamp": "2025-08-16T10:30:00.000Z",
 *     "traceId": "get_review_1692187800123"
 *   }
 * }
 *
 * GET /api/v1/reviews/507f1f77bcf86cd799439011?include=car,user
 *
 * Response with includes (200 OK):
 * {
 *   "status": "success",
 *   "message": "Review retrieved successfully",
 *   "data": {
 *     "id": "507f1f77bcf86cd799439011",
 *     "carId": "507f1f77bcf86cd799439012",
 *     "userId": "507f1f77bcf86cd799439013",
 *     "rating": 5,
 *     "title": "Excellent car!",
 *     "comment": "Had a great experience with this rental.",
 *     "car": {
 *       "id": "507f1f77bcf86cd799439012",
 *       "make": "Toyota",
 *       "model": "Camry",
 *       "year": 2023
 *     },
 *     "user": {
 *       "id": "507f1f77bcf86cd799439013",
 *       "name": "John Doe"
 *     },
 *     "createdAt": "2025-08-16T10:30:00.000Z",
 *     "updatedAt": "2025-08-16T10:30:00.000Z"
 *   }
 * }
 *
 * Error Response (404 Not Found):
 * {
 *   "status": "error",
 *   "message": "Review not found",
 *   "error": {
 *     "code": "REVIEW_NOT_FOUND"
 *   },
 *   "meta": {
 *     "timestamp": "2025-08-16T10:30:00.000Z",
 *     "traceId": "get_review_1692187800123"
 *   }
 * }
 */
