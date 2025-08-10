/**
 * Review Repository Interface
 *
 * Defines the contract for review data access operations
 * This interface ensures consistent implementation and enables dependency injection
 */

export interface IReviewRepository {
  /**
   * Find reviews with filters, pagination, and sorting
   * @param options - Query options including filters, pagination, and sorting
   * @returns Paginated review results
   */
  findMany(options: {
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
  }): Promise<{
    reviews: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Find a review by ID
   * @param id - Review ID to search for
   * @param include - Optional relations to include
   * @returns Review data or null if not found
   */
  findById(
    id: string,
    include?: { car?: boolean; user?: boolean }
  ): Promise<any | null>;

  /**
   * Create a new review
   * @param reviewData - Review data to create
   * @returns Created review
   */
  create(reviewData: {
    userId: string;
    carId: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<any>;

  /**
   * Update an existing review
   * @param id - Review ID to update
   * @param updateData - Partial review data to update
   * @returns Updated review or null if not found
   */
  update(
    id: string,
    updateData: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ): Promise<any | null>;

  /**
   * Delete a review by ID
   * @param id - Review ID to delete
   * @returns Boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get review statistics for a car
   * @param carId - Car ID to get stats for
   * @returns Review statistics
   */
  getCarReviewStats(carId: string): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { [key: number]: number };
  }>;

  /**
   * Get review statistics for a user
   * @param userId - User ID to get stats for
   * @returns User review statistics
   */
  getUserReviewStats(userId: string): Promise<{
    totalReviews: number;
    averageRating: number;
  }>;
}
