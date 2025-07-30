/**
 * Standardized API response utilities
 * Provides consistent response formatting across the application
 */

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    traceId?: string;
    requestId?: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Create a successful API response
 */
export const createSuccessResponse = <T>(
  message: string,
  data?: T,
  traceId?: string,
  meta?: Record<string, any>
): ApiResponse<T> => {
  const responseMeta: {
    timestamp: string;
    traceId?: string;
    requestId?: string;
  } = {
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (traceId) {
    responseMeta.traceId = traceId;
  }

  const response: ApiResponse<T> = {
    status: "success",
    message,
    meta: responseMeta,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return response;
};

/**
 * Create an error API response
 */
export const createErrorResponse = (
  message: string,
  code: string,
  details?: any,
  traceId?: string,
  meta?: Record<string, any>
): ApiResponse => {
  const responseMeta: {
    timestamp: string;
    traceId?: string;
    requestId?: string;
  } = {
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (traceId) {
    responseMeta.traceId = traceId;
  }

  return {
    status: "error",
    message,
    error: {
      code,
      details,
    },
    meta: responseMeta,
  };
};

/**
 * Create a paginated response
 */
export const createPaginatedResponse = <T>(
  message: string,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  traceId?: string
): PaginatedResponse<T[]> => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const responseMeta: {
    timestamp: string;
    traceId?: string;
    requestId?: string;
  } = {
    timestamp: new Date().toISOString(),
  };

  if (traceId) {
    responseMeta.traceId = traceId;
  }

  return {
    status: "success",
    message,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
    meta: responseMeta,
  };
};

/**
 * HTTP status codes for different scenarios
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Common error codes used across the application
 */
export const ERROR_CODES = {
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INVALID_INPUT: "INVALID_INPUT",

  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",

  // System
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
  RATE_LIMITED: "RATE_LIMITED",

  // Database
  DATABASE_ERROR: "DATABASE_ERROR",
  CONNECTION_ERROR: "CONNECTION_ERROR",
} as const;
