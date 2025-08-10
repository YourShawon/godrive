/**
 * Review Query Repository
 *
 * Handles complex queries, filtering, and search operations for reviews
 */

import { logger } from "../../../utils/logger/config.js";
import { prisma } from "../../../config/db.js";

export class ReviewQueryRepository {
  /**
   * Find reviews with filters, pagination, and sorting
   */
  async findMany(options: {
    filters?: any;
    pagination?: { page: number; limit: number };
    sort?: { field: string; order: "asc" | "desc" };
    include?: { car?: boolean; user?: boolean };
  }) {
    const {
      filters = {},
      pagination = { page: 1, limit: 10 },
      sort = { field: "createdAt", order: "desc" as const },
      include = { car: false, user: false },
    } = options;

    try {
      logger.info("🔍 ReviewQueryRepository: Finding reviews with filters", {
        filters,
        pagination,
        sort,
        include,
      });

      // Calculate skip for pagination
      const skip = (pagination.page - 1) * pagination.limit;

      // Build Prisma where clause
      const where = this.buildWhereClause(filters);

      // Build order by clause
      const orderBy: any = {};
      orderBy[sort.field] = sort.order;

      // Build include clause
      const includeClause = this.buildIncludeClause(include);

      // Execute queries in parallel
      const [reviews, total] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy,
          skip,
          take: pagination.limit,
          include: includeClause,
        }),
        prisma.review.count({ where }),
      ]);

      logger.info("✅ Reviews found successfully", {
        totalFound: total,
        returnedCount: reviews.length,
        page: pagination.page,
        limit: pagination.limit,
      });

      return {
        reviews,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      };
    } catch (error) {
      logger.error("❌ Error finding reviews", {
        filters,
        pagination,
        sort,
        include,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  /**
   * Build Prisma where clause from filters
   */
  private buildWhereClause(filters: any): any {
    const where: any = {};

    // Filter by car ID
    if (filters.carId) where.carId = filters.carId;

    // Filter by user ID
    if (filters.userId) where.userId = filters.userId;

    // Filter by exact rating
    if (filters.rating) where.rating = parseInt(filters.rating);

    // Filter by rating range
    if (filters.minRating || filters.maxRating) {
      where.rating = {};
      if (filters.minRating) where.rating.gte = filters.minRating;
      if (filters.maxRating) where.rating.lte = filters.maxRating;
    }

    // Date range filtering
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    // Search functionality (searches in title and comment)
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { comment: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return where;
  }

  /**
   * Build Prisma include clause
   */
  private buildIncludeClause(include: { car?: boolean; user?: boolean }): any {
    const includeClause: any = {};

    if (include.car) {
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

    if (include.user) {
      includeClause.user = {
        select: {
          id: true,
          name: true,
          // Don't include sensitive data like email, password
        },
      };
    }

    return includeClause;
  }
}
