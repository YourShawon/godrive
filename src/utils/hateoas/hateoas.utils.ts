/**
 * HATEOAS (Hypermedia as the Engine of Application State) Utilities
 *
 * Implements Level 3 REST Maturity - Self-descriptive API responses
 * Used by FAANG companies for truly RESTful APIs
 *
 * Benefits:
 * - Self-discoverable API
 * - Reduced coupling between client and server
 * - Dynamic navigation based on current state
 * - Better API documentation through links
 */

export interface HATEOASLink {
  href: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  rel: string;
  type?: string;
  title?: string;
}

export interface HATEOASResponse<T = any> {
  data: T;
  _links: Record<string, HATEOASLink>;
  _meta?: {
    version: string;
    timestamp: string;
    [key: string]: any;
  };
}

/**
 * HATEOAS Link Builder for User Resources
 */
export class UserHATEOAS {
  private static baseUrl =
    process.env.API_BASE_URL || "http://localhost:3000/api/v1";

  /**
   * Generate HATEOAS links for a user resource
   */
  static generateUserLinks(
    userId: string,
    userRole?: string
  ): Record<string, HATEOASLink> {
    const links: Record<string, HATEOASLink> = {
      // Self reference
      self: {
        href: `${this.baseUrl}/users/${userId}`,
        method: "GET",
        rel: "self",
        type: "application/json",
        title: "Get user details",
      },

      // Update user
      update: {
        href: `${this.baseUrl}/users/${userId}`,
        method: "PUT",
        rel: "update",
        type: "application/json",
        title: "Update user information",
      },

      // Partial update
      patch: {
        href: `${this.baseUrl}/users/${userId}`,
        method: "PATCH",
        rel: "patch",
        type: "application/json",
        title: "Partially update user",
      },

      // Delete user (admin only for now)
      delete: {
        href: `${this.baseUrl}/users/${userId}`,
        method: "DELETE",
        rel: "delete",
        type: "application/json",
        title: "Delete user account",
      },

      // User's bookings
      bookings: {
        href: `${this.baseUrl}/users/${userId}/bookings`,
        method: "GET",
        rel: "related",
        type: "application/json",
        title: "Get user bookings",
      },

      // User's payment methods
      payments: {
        href: `${this.baseUrl}/users/${userId}/payment-methods`,
        method: "GET",
        rel: "related",
        type: "application/json",
        title: "Get user payment methods",
      },

      // User's preferences
      preferences: {
        href: `${this.baseUrl}/users/${userId}/preferences`,
        method: "GET",
        rel: "related",
        type: "application/json",
        title: "Get user preferences",
      },
    };

    // Add role-specific links
    if (userRole === "ADMIN") {
      links.adminPanel = {
        href: `${this.baseUrl}/admin/users/${userId}`,
        method: "GET",
        rel: "admin",
        type: "application/json",
        title: "Admin user management",
      };
    }

    if (userRole === "CUSTOMER") {
      links.searchCars = {
        href: `${this.baseUrl}/cars/search`,
        method: "GET",
        rel: "action",
        type: "application/json",
        title: "Search available cars",
      };
    }

    return links;
  }

  /**
   * Generate collection-level HATEOAS links
   */
  static generateCollectionLinks(): Record<string, HATEOASLink> {
    return {
      self: {
        href: `${this.baseUrl}/users`,
        method: "GET",
        rel: "self",
        type: "application/json",
        title: "Get users collection",
      },

      create: {
        href: `${this.baseUrl}/users`,
        method: "POST",
        rel: "create",
        type: "application/json",
        title: "Create new user",
      },

      search: {
        href: `${this.baseUrl}/users/search`,
        method: "GET",
        rel: "search",
        type: "application/json",
        title: "Search users",
      },
    };
  }
}

/**
 * Generic HATEOAS Response Builder
 */
export class HATEOASBuilder {
  /**
   * Build a complete HATEOAS response
   */
  static buildResponse<T>(
    data: T,
    links: Record<string, HATEOASLink>,
    meta?: any
  ): HATEOASResponse<T> {
    return {
      data,
      _links: links,
      _meta: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  /**
   * Add pagination links for collections
   */
  static addPaginationLinks(
    baseUrl: string,
    currentPage: number,
    totalPages: number,
    pageSize: number
  ): Record<string, HATEOASLink> {
    const links: Record<string, HATEOASLink> = {};

    // First page
    if (currentPage > 1) {
      links.first = {
        href: `${baseUrl}?page=1&limit=${pageSize}`,
        method: "GET",
        rel: "first",
        type: "application/json",
        title: "First page",
      };
    }

    // Previous page
    if (currentPage > 1) {
      links.prev = {
        href: `${baseUrl}?page=${currentPage - 1}&limit=${pageSize}`,
        method: "GET",
        rel: "prev",
        type: "application/json",
        title: "Previous page",
      };
    }

    // Next page
    if (currentPage < totalPages) {
      links.next = {
        href: `${baseUrl}?page=${currentPage + 1}&limit=${pageSize}`,
        method: "GET",
        rel: "next",
        type: "application/json",
        title: "Next page",
      };
    }

    // Last page
    if (currentPage < totalPages) {
      links.last = {
        href: `${baseUrl}?page=${totalPages}&limit=${pageSize}`,
        method: "GET",
        rel: "last",
        type: "application/json",
        title: "Last page",
      };
    }

    return links;
  }
}
