/**
 * Review Repository (Facade)
 *
 * Composed of smaller, focused repositories
 * Implements the IReviewRepository interface
 */

import { logger } from "../../../utils/logger/config.js";
import { IReviewRepository } from "../interfaces/review.repository.interface.js";
import { CoreReviewRepository } from "./review-core.repository.js";
import { ReviewQueryRepository } from "./review-query.repository.js";
import { ReviewStatsRepository } from "./review-stats.repository.js";

export class ReviewRepository implements IReviewRepository {
  private coreRepo: CoreReviewRepository;
  private queryRepo: ReviewQueryRepository;
  private statsRepo: ReviewStatsRepository;

  constructor() {
    this.coreRepo = new CoreReviewRepository();
    this.queryRepo = new ReviewQueryRepository();
    this.statsRepo = new ReviewStatsRepository();

    logger.info("🏗️ ReviewRepository: Initialized with composed repositories");
  }

  // Delegate to CoreReviewRepository
  async findById(id: string, include?: { car?: boolean; user?: boolean }) {
    return this.coreRepo.findById(id, include);
  }

  async create(reviewData: {
    userId: string;
    carId: string;
    rating: number;
    title?: string;
    comment: string;
  }) {
    return this.coreRepo.create(reviewData);
  }

  async update(
    id: string,
    updateData: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ) {
    return this.coreRepo.update(id, updateData);
  }

  async delete(id: string): Promise<boolean> {
    return this.coreRepo.delete(id);
  }

  // Delegate to ReviewQueryRepository
  async findMany(options: {
    filters?: any;
    pagination?: { page: number; limit: number };
    sort?: { field: string; order: "asc" | "desc" };
    include?: { car?: boolean; user?: boolean };
  }) {
    return this.queryRepo.findMany(options);
  }

  // Delegate to ReviewStatsRepository
  async getCarReviewStats(carId: string) {
    return this.statsRepo.getCarStats(carId);
  }

  async getUserReviewStats(userId: string) {
    return this.statsRepo.getUserStats(userId);
  }

  // Additional method from stats repository
  async getPlatformStats() {
    return this.statsRepo.getGlobalStats();
  }
}

// Export a singleton instance
export const reviewRepository = new ReviewRepository();
