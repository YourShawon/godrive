/**
 * Review Service
 *
 * Business logic layer for review operations
 * Uses repository interface for data access
 */

import { logger } from "../../../utils/logger/config.js";
import type { IReviewRepository } from "../interfaces/review.repository.interface.js";

export class ReviewService {
  constructor(private reviewRepository: IReviewRepository) {}

  /**
   * Get reviews with filters and pagination
   */
  async getReviews(options: {
    filters?: {
      carId?: string;
      userId?: string;
      rating?: string;
      minRating?: number;
      maxRating?: number;
      search?: string;
      verified?: boolean;
      startDate?: string;
      endDate?: string;
      minHelpful?: number;
    };
    pagination?: { page: number; limit: number };
    sort?: { field: string; order: "asc" | "desc" };
    include?: { car?: boolean; user?: boolean };
  }) {
    const traceId = `review_service_${Date.now()}`;

    try {
      logger.info("🔍 ReviewService: Getting reviews", {
        traceId,
        options,
      });

      // Validate pagination limits
      if (options.pagination) {
        const { page, limit } = options.pagination;
        if (page < 1) {
          throw new Error("Page must be greater than 0");
        }
        if (limit < 1 || limit > 100) {
          throw new Error("Limit must be between 1 and 100");
        }
      }

      // Validate rating ranges
      if (options.filters?.minRating && options.filters?.maxRating) {
        if (options.filters.minRating > options.filters.maxRating) {
          throw new Error(
            "Minimum rating cannot be greater than maximum rating"
          );
        }
      }

      const result = await this.reviewRepository.findMany(options);

      logger.info("✅ ReviewService: Reviews retrieved successfully", {
        traceId,
        totalFound: result.total,
        returnedCount: result.reviews.length,
      });

      return result;
    } catch (error) {
      logger.error("❌ ReviewService: Error getting reviews", {
        traceId,
        options,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string, include?: { car?: boolean; user?: boolean }) {
    const traceId = `review_service_get_${Date.now()}`;

    try {
      logger.info("🔍 ReviewService: Getting review by ID", {
        traceId,
        reviewId: id,
        include,
      });

      if (!id || typeof id !== "string") {
        throw new Error("Valid review ID is required");
      }

      const review = await this.reviewRepository.findById(id, include);

      if (!review) {
        logger.warn("⚠️ ReviewService: Review not found", {
          traceId,
          reviewId: id,
        });
        return null;
      }

      logger.info("✅ ReviewService: Review retrieved successfully", {
        traceId,
        reviewId: id,
      });

      return review;
    } catch (error) {
      logger.error("❌ ReviewService: Error getting review by ID", {
        traceId,
        reviewId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get car review statistics
   */
  async getCarReviewStats(carId: string) {
    const traceId = `review_service_car_stats_${Date.now()}`;

    try {
      logger.info("📊 ReviewService: Getting car review stats", {
        traceId,
        carId,
      });

      if (!carId || typeof carId !== "string") {
        throw new Error("Valid car ID is required");
      }

      const stats = await this.reviewRepository.getCarReviewStats(carId);

      logger.info("✅ ReviewService: Car review stats retrieved successfully", {
        traceId,
        carId,
        stats,
      });

      return stats;
    } catch (error) {
      logger.error("❌ ReviewService: Error getting car review stats", {
        traceId,
        carId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get user review statistics
   */
  async getUserReviewStats(userId: string) {
    const traceId = `review_service_user_stats_${Date.now()}`;

    try {
      logger.info("📊 ReviewService: Getting user review stats", {
        traceId,
        userId,
      });

      if (!userId || typeof userId !== "string") {
        throw new Error("Valid user ID is required");
      }

      const stats = await this.reviewRepository.getUserReviewStats(userId);

      logger.info(
        "✅ ReviewService: User review stats retrieved successfully",
        {
          traceId,
          userId,
          stats,
        }
      );

      return stats;
    } catch (error) {
      logger.error("❌ ReviewService: Error getting user review stats", {
        traceId,
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create a new review
   */
  async createReview(reviewData: {
    carId: string;
    userId: string;
    rating: number;
    title: string;
    comment?: string;
  }) {
    const traceId = `create_review_service_${Date.now()}`;

    try {
      logger.info("📝 ReviewService: Creating new review", {
        traceId,
        carId: reviewData.carId,
        userId: reviewData.userId,
        rating: reviewData.rating,
      });

      // TODO: Add business logic validations:
      // 1. Verify car exists
      // 2. Verify user hasn't already reviewed this car
      // 3. Verify user has actually booked this car (future enhancement)

      // For now, proceed with creation
      const newReview = await this.reviewRepository.create({
        carId: reviewData.carId,
        userId: reviewData.userId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment || "",
      });

      logger.info("✅ ReviewService: Review created successfully", {
        traceId,
        reviewId: newReview.id,
        carId: newReview.carId,
        userId: newReview.userId,
      });

      return newReview;
    } catch (error) {
      logger.error("❌ ReviewService: Error creating review", {
        traceId,
        reviewData,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}

// Export service instance with repository injection
import { reviewRepository } from "../repositories/review.repository.js";
export const reviewService = new ReviewService(reviewRepository);
