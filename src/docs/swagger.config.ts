import { authSchemas } from "@modules/auth/auth.swagger.js";
import { commonSchemas } from "./schemas/common.js";

export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "GoDrive Car Rental API",
    version: "1.0.0",
    description: `
# GoDrive Car Rental Platform API

A comprehensive car rental platform built with modular monolithic architecture.

## Features
- 🔐 JWT Authentication with refresh tokens
- 🚗 Car search and filtering
- 📅 Booking management
- 💳 Payment processing with Stripe
- ⭐ Reviews and ratings
- 📱 Real-time notifications
- 👨‍💼 Admin dashboard

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Error Handling
All endpoints return consistent error responses with proper HTTP status codes.
    `,
    contact: {
      name: "GoDrive API Support",
      email: "api@godrive.com",
      url: "https://godrive.com/support",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "Development Server",
    },
    {
      url: "https://api.godrive.com/api/v1",
      description: "Production Server",
    },
  ],
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Users",
      description: "User profile management",
    },
    {
      name: "Cars",
      description: "Car listing, search, and management",
    },
    {
      name: "Bookings",
      description: "Booking creation and management",
    },
    {
      name: "Payments",
      description: "Payment processing and refunds",
    },
    {
      name: "Reviews",
      description: "Review and rating system",
    },
    {
      name: "Wishlist",
      description: "User wishlist management",
    },
    {
      name: "Notifications",
      description: "Notification system",
    },
    {
      name: "Admin",
      description: "Administrative endpoints",
    },
  ],
  components: {
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      // Other module schemas will be added here
    },
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT Authorization header using the Bearer scheme.",
      },
    },
    responses: {
      UnauthorizedError: {
        description: "Authentication information is missing or invalid",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              status: "error",
              message: "Unauthorized access",
              code: "UNAUTHORIZED",
            },
          },
        },
      },
      ForbiddenError: {
        description: "Insufficient permissions",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              status: "error",
              message: "Forbidden access",
              code: "FORBIDDEN",
            },
          },
        },
      },
      NotFoundError: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse",
            },
            example: {
              status: "error",
              message: "Resource not found",
              code: "NOT_FOUND",
            },
          },
        },
      },
      ValidationError: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ValidationErrorResponse",
            },
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
};
