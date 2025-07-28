export const commonSchemas = {
  // Success Response Schema
  SuccessResponse: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["success"],
        example: "success",
      },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
      data: {
        type: "object",
        description: "Response data",
      },
    },
    required: ["status"],
  },

  // Error Response Schema
  ErrorResponse: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["error"],
        example: "error",
      },
      message: {
        type: "string",
        example: "An error occurred",
      },
      code: {
        type: "string",
        example: "INTERNAL_ERROR",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-07-28T10:30:00.000Z",
      },
    },
    required: ["status", "message"],
  },

  // Validation Error Response Schema
  ValidationErrorResponse: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["error"],
        example: "error",
      },
      message: {
        type: "string",
        example: "Validation failed",
      },
      code: {
        type: "string",
        example: "VALIDATION_ERROR",
      },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: {
              type: "string",
              example: "email",
            },
            message: {
              type: "string",
              example: "Invalid email format",
            },
            code: {
              type: "string",
              example: "INVALID_FORMAT",
            },
          },
        },
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2025-07-28T10:30:00.000Z",
      },
    },
    required: ["status", "message", "errors"],
  },

  // Pagination Schema
  PaginationMeta: {
    type: "object",
    properties: {
      page: {
        type: "integer",
        minimum: 1,
        example: 1,
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 100,
        example: 10,
      },
      total: {
        type: "integer",
        minimum: 0,
        example: 150,
      },
      totalPages: {
        type: "integer",
        minimum: 0,
        example: 15,
      },
      hasNextPage: {
        type: "boolean",
        example: true,
      },
      hasPrevPage: {
        type: "boolean",
        example: false,
      },
    },
    required: ["page", "limit", "total", "totalPages"],
  },

  // Paginated Response Schema
  PaginatedResponse: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["success"],
        example: "success",
      },
      data: {
        type: "array",
        items: {
          type: "object",
        },
      },
      meta: {
        $ref: "#/components/schemas/PaginationMeta",
      },
    },
    required: ["status", "data", "meta"],
  },

  // UUID Schema
  UUID: {
    type: "string",
    format: "uuid",
    example: "123e4567-e89b-12d3-a456-426614174000",
  },

  // DateTime Schema
  DateTime: {
    type: "string",
    format: "date-time",
    example: "2025-07-28T10:30:00.000Z",
  },

  // Date Schema
  Date: {
    type: "string",
    format: "date",
    example: "2025-07-28",
  },
};
