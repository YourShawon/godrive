/**
 * Review Statistics Repository
 *
 * Handles analytics, statistics, and aggregate operations for reviews
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";

export class ReviewStatsRepository {
  /**
   * Get review statistics for a specific car
   */
  async getCarStats(carId: string) {
    try {
      logger.info("📊 ReviewStatsRepository: Getting car review stats", {
        carId,
      });

      const [statsResult, ratingDistribution] = await Promise.all([
        // Get aggregated statistics
        prisma.review.aggregate({
          where: { carId },
          _avg: { rating: true },
          _count: { id: true },
          _min: { rating: true },
          _max: { rating: true },
        }),

        // Get rating distribution
        prisma.review.groupBy({
          by: ["rating"],
          where: { carId },
          _count: { id: true },
          orderBy: { rating: "asc" },
        }),
      ]);

      const stats = {
        averageRating: statsResult._avg.rating || 0,
        totalReviews: statsResult._count.id,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.id;
            return acc;
          },
          {} as { [key: number]: number }
        ),
      };

      logger.info("✅ Car review stats retrieved successfully", {
        carId,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });

      return stats;
    } catch (error) {
      logger.error("❌ Error getting car review stats", {
        carId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get review statistics for a specific user
   */
  async getUserStats(userId: string) {
    try {
      logger.info("📊 ReviewStatsRepository: Getting user review stats", {
        userId,
      });

      const [statsResult, ratingDistribution] = await Promise.all([
        // Get aggregated statistics
        prisma.review.aggregate({
          where: { userId },
          _avg: { rating: true },
          _count: { id: true },
          _min: { rating: true },
          _max: { rating: true },
        }),

        // Get rating distribution
        prisma.review.groupBy({
          by: ["rating"],
          where: { userId },
          _count: { id: true },
          orderBy: { rating: "asc" },
        }),
      ]);

      const stats = {
        averageRating: statsResult._avg.rating || 0,
        totalReviews: statsResult._count.id,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.id;
            return acc;
          },
          {} as { [key: number]: number }
        ),
      };

      logger.info("✅ User review stats retrieved successfully", {
        userId,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });

      return stats;
    } catch (error) {
      logger.error("❌ Error getting user review stats", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get global review statistics across all reviews
   */
  async getGlobalStats() {
    try {
      logger.info("📊 ReviewStatsRepository: Getting global review stats");

      const [statsResult, ratingDistribution, topRatedCars, mostActiveUsers] =
        await Promise.all([
          // Get aggregated statistics
          prisma.review.aggregate({
            _avg: { rating: true },
            _count: { id: true },
            _min: { rating: true },
            _max: { rating: true },
          }),

          // Get global rating distribution
          prisma.review.groupBy({
            by: ["rating"],
            _count: { id: true },
            orderBy: { rating: "asc" },
          }),

          // Get top-rated cars (with at least 3 reviews)
          prisma.review.groupBy({
            by: ["carId"],
            _avg: { rating: true },
            _count: { id: true },
            having: { id: { _count: { gte: 3 } } },
            orderBy: { _avg: { rating: "desc" } },
            take: 10,
          }),

          // Get most active reviewers
          prisma.review.groupBy({
            by: ["userId"],
            _count: { id: true },
            orderBy: { _count: { id: "desc" } },
            take: 10,
          }),
        ]);

      const stats = {
        averageRating: statsResult._avg.rating || 0,
        totalReviews: statsResult._count.id,
        minRating: statsResult._min.rating || 0,
        maxRating: statsResult._max.rating || 0,
        ratingDistribution: ratingDistribution.map((item) => ({
          rating: item.rating,
          count: item._count.id,
        })),
        topRatedCars: topRatedCars.map((item) => ({
          carId: item.carId,
          averageRating: item._avg.rating,
          reviewCount: item._count.id,
        })),
        mostActiveUsers: mostActiveUsers.map((item) => ({
          userId: item.userId,
          reviewCount: item._count.id,
        })),
      };

      logger.info("✅ Global review stats retrieved successfully", {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        topRatedCarsCount: stats.topRatedCars.length,
        mostActiveUsersCount: stats.mostActiveUsers.length,
      });

      return stats;
    } catch (error) {
      logger.error("❌ Error getting global review stats", {
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Get monthly review statistics for analytics dashboard
   */
  async getMonthlyStats(year: number) {
    try {
      logger.info("📊 ReviewStatsRepository: Getting monthly review stats", {
        year,
      });

      // Get reviews grouped by month for the specified year
      const monthlyData = await prisma.review.findMany({
        where: {
          createdAt: {
            gte: new Date(`${year}-01-01`),
            lt: new Date(`${year + 1}-01-01`),
          },
        },
        select: {
          createdAt: true,
          rating: true,
        },
      });

      // Group by month and calculate statistics
      const monthlyStats: { [key: number]: any } = {};

      monthlyData.forEach((review) => {
        const month = review.createdAt.getMonth() + 1; // 1-12

        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            month,
            totalReviews: 0,
            ratings: [],
          };
        }

        monthlyStats[month].totalReviews++;
        monthlyStats[month].ratings.push(review.rating);
      });

      // Calculate averages and fill missing months
      const result = [];
      for (let month = 1; month <= 12; month++) {
        const data = monthlyStats[month];
        if (data) {
          const averageRating =
            data.ratings.reduce(
              (sum: number, rating: number) => sum + rating,
              0
            ) / data.ratings.length;

          result.push({
            month,
            totalReviews: data.totalReviews,
            averageRating: Math.round(averageRating * 100) / 100,
          });
        } else {
          result.push({
            month,
            totalReviews: 0,
            averageRating: 0,
          });
        }
      }

      logger.info("✅ Monthly review stats retrieved successfully", {
        year,
        monthsWithData: Object.keys(monthlyStats).length,
      });

      return result;
    } catch (error) {
      logger.error("❌ Error getting monthly review stats", {
        year,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
