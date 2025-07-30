/**
 * User Cache Key Patterns
 * Centralized cache key generation for user-related operations
 */

export const UserCacheKeys = {
  // Individual user by ID
  byId: (userId: string) => ["user", "id", userId],

  // User by email
  byEmail: (email: string) => ["user", "email", email.toLowerCase()],

  // User profile with additional data
  profile: (userId: string) => ["user", "profile", userId],

  // User permissions/roles
  permissions: (userId: string) => ["user", "permissions", userId],

  // User list with filters
  list: (filters: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }) => {
    const parts = ["users", "list"];

    if (filters.page) parts.push(`page:${filters.page}`);
    if (filters.limit) parts.push(`limit:${filters.limit}`);
    if (filters.role) parts.push(`role:${filters.role}`);
    if (filters.isActive !== undefined)
      parts.push(`active:${filters.isActive}`);
    if (filters.search) parts.push(`search:${filters.search.toLowerCase()}`);

    return parts;
  },

  // User statistics
  stats: () => ["user", "stats", "global"],

  // User session data
  session: (userId: string, sessionId: string) => [
    "user",
    "session",
    userId,
    sessionId,
  ],
} as const;
