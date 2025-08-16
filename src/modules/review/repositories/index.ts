/**
 * Review Repositories Index
 *
 * Centralized exports for all review repository components
 */

// Main repository (facade)
export { ReviewRepository, reviewRepository } from "./review.repository.js";

// Specialized repositories
export { CoreReviewRepository } from "./review-core.repository.js";
export { ReviewQueryRepository } from "./review-query.repository.js";
export { ReviewStatsRepository } from "./review-stats.repository.js";
