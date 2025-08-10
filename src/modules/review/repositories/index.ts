/**
 * Review Repositories Index
 *
 * Centralized exports for all review repository components
 */

// Main repository (facade)
export { ReviewRepository, reviewRepository } from "./review.repository.js";

// Specialized repositories
export { CoreReviewRepository } from "./core/core-review.repository.js";
export { ReviewQueryRepository } from "./query/review-query.repository.js";
export { ReviewStatsRepository } from "./stats/review-stats.repository.js";
