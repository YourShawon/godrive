/**
 * Core Review Repository
 *
 * Handles basic CRUD operations for reviews
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";

export class CoreReviewRepository {
  /**
   * Find a review by ID
   */
  async findById(id: string, include?: { car?: boolean; user?: boolean }) {
    try {
      logger.info("🔍 CoreReviewRepository: Finding review by ID", {
        reviewId: id,
      });

      const includeClause: any = {};
      if (include?.car) {
        includeClause.car = {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            type: true,
            pricePerDay: true,
            images: true,
          },
        };
      }
      if (include?.user) {
        includeClause.user = {
          select: {
            id: true,
            name: true,
          },
        };
      }

      const review = await prisma.review.findUnique({
        where: { id },
        include: includeClause,
      });

      if (review) {
        logger.info("✅ Review found successfully", { reviewId: id });
      } else {
        logger.warn("⚠️ Review not found", { reviewId: id });
      }

      return review;
    } catch (error) {
      logger.error("❌ Error finding review by ID", {
        reviewId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Create a new review
   */
  async create(reviewData: {
    userId: string;
    carId: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    try {
      logger.info("🆕 CoreReviewRepository: Creating new review", {
        reviewData,
      });

      const review = await prisma.review.create({
        data: {
          userId: reviewData.userId,
          carId: reviewData.carId,
          rating: reviewData.rating,
          title: reviewData.title || null,
          comment: reviewData.comment,
        },
      });

      logger.info("✅ Review created successfully", { reviewId: review.id });
      return review;
    } catch (error) {
      logger.error("❌ Error creating review", {
        reviewData,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Update an existing review
   */
  async update(
    id: string,
    updateData: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ) {
    try {
      logger.info("🔄 CoreReviewRepository: Updating review", {
        reviewId: id,
        updateData,
      });

      const review = await prisma.review.update({
        where: { id },
        data: updateData,
      });

      logger.info("✅ Review updated successfully", { reviewId: id });
      return review;
    } catch (error) {
      logger.error("❌ Error updating review", {
        reviewId: id,
        updateData,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (
        error instanceof Error &&
        error.message.includes("Record to update not found")
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a review by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      logger.info("🗑️ CoreReviewRepository: Deleting review", { reviewId: id });

      await prisma.review.delete({
        where: { id },
      });

      logger.info("✅ Review deleted successfully", { reviewId: id });
      return true;
    } catch (error) {
      logger.error("❌ Error deleting review", {
        reviewId: id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      if (
        error instanceof Error &&
        error.message.includes("Record to delete does not exist")
      ) {
        return false;
      }
      throw error;
    }
  }
}
