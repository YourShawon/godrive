/**
 * Review Module Exports
 *
 * Centralized exports for the review module
 */

// Interfaces
export type { IReviewRepository } from "./interfaces/review.repository.interface.js";

// Repositories
export {
  ReviewRepository,
  reviewRepository,
} from "./repositories/review.repository.js";

// Services
export { ReviewService, reviewService } from "./services/review.service.js";

// Controllers
export { listReviews } from "./controllers/listReviews.controller.js";

// Schemas
export { listReviewsQuerySchemas } from "./schemas/listReviews.schemas.js";
