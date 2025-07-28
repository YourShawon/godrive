export const authSchemas = {
  // User Registration Request
  RegisterRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
        description: "User email address",
      },
      password: {
        type: "string",
        minLength: 8,
        example: "SecurePass123!",
        description: "Password must be at least 8 characters long",
      },
      name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "John Doe",
        description: "Full name of the user",
      },
      phone: {
        type: "string",
        pattern: "^\\+?[1-9]\\d{1,14}$",
        example: "+1234567890",
        description: "Phone number (optional)",
      },
      preferences: {
        type: "object",
        properties: {
          preferredCarTypes: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "SUV",
                "Sedan",
                "Hatchback",
                "Coupe",
                "Convertible",
                "Pickup",
                "Van",
              ],
            },
            example: ["SUV", "Sedan"],
          },
          language: {
            type: "string",
            enum: ["en", "es", "fr", "de"],
            example: "en",
            default: "en",
          },
          currency: {
            type: "string",
            enum: ["USD", "EUR", "GBP", "CAD"],
            example: "USD",
            default: "USD",
          },
        },
      },
    },
    required: ["email", "password", "name"],
  },

  // User Login Request
  LoginRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
      password: {
        type: "string",
        example: "SecurePass123!",
      },
    },
    required: ["email", "password"],
  },

  // User Object
  User: {
    type: "object",
    properties: {
      id: {
        $ref: "#/components/schemas/UUID",
      },
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
      name: {
        type: "string",
        example: "John Doe",
      },
      phone: {
        type: "string",
        example: "+1234567890",
      },
      role: {
        type: "string",
        enum: ["customer", "admin", "support"],
        example: "customer",
      },
      isEmailVerified: {
        type: "boolean",
        example: true,
      },
      preferences: {
        type: "object",
        properties: {
          preferredCarTypes: {
            type: "array",
            items: {
              type: "string",
            },
          },
          language: {
            type: "string",
            example: "en",
          },
          currency: {
            type: "string",
            example: "USD",
          },
        },
      },
      createdAt: {
        $ref: "#/components/schemas/DateTime",
      },
      updatedAt: {
        $ref: "#/components/schemas/DateTime",
      },
    },
    required: ["id", "email", "name", "role", "createdAt", "updatedAt"],
  },

  // Auth Response (Login/Register)
  AuthResponse: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["success"],
        example: "success",
      },
      message: {
        type: "string",
        example: "Authentication successful",
      },
      data: {
        type: "object",
        properties: {
          user: {
            $ref: "#/components/schemas/User",
          },
          tokens: {
            type: "object",
            properties: {
              accessToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                description: "JWT access token (expires in 15 minutes)",
              },
              refreshToken: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                description: "JWT refresh token (expires in 7 days)",
              },
              expiresIn: {
                type: "integer",
                example: 900,
                description: "Access token expiration time in seconds",
              },
            },
            required: ["accessToken", "refreshToken", "expiresIn"],
          },
        },
        required: ["user", "tokens"],
      },
    },
    required: ["status", "data"],
  },

  // Refresh Token Request
  RefreshTokenRequest: {
    type: "object",
    properties: {
      refreshToken: {
        type: "string",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        description: "Valid refresh token",
      },
    },
    required: ["refreshToken"],
  },

  // Forgot Password Request
  ForgotPasswordRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
    },
    required: ["email"],
  },

  // Reset Password Request
  ResetPasswordRequest: {
    type: "object",
    properties: {
      token: {
        type: "string",
        example: "reset-token-here",
        description: "Password reset token from email",
      },
      newPassword: {
        type: "string",
        minLength: 8,
        example: "NewSecurePass123!",
        description: "New password (minimum 8 characters)",
      },
    },
    required: ["token", "newPassword"],
  },

  // Change Password Request
  ChangePasswordRequest: {
    type: "object",
    properties: {
      currentPassword: {
        type: "string",
        example: "CurrentPass123!",
      },
      newPassword: {
        type: "string",
        minLength: 8,
        example: "NewSecurePass123!",
      },
    },
    required: ["currentPassword", "newPassword"],
  },
};

// Auth endpoint paths (to be added to main swagger config)
export const authPaths = {
  "/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Create a new user account with email and password",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterRequest",
            },
          },
        },
      },
      responses: {
        "201": {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse",
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/ValidationError",
        },
        "409": {
          description: "Email already exists",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Email already registered",
                code: "EMAIL_EXISTS",
              },
            },
          },
        },
      },
    },
  },

  "/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "User login",
      description: "Authenticate user and return JWT tokens",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/LoginRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse",
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/ValidationError",
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Invalid email or password",
                code: "INVALID_CREDENTIALS",
              },
            },
          },
        },
      },
    },
  },

  "/auth/refresh": {
    post: {
      tags: ["Authentication"],
      summary: "Refresh access token",
      description: "Get a new access token using refresh token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RefreshTokenRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Token refreshed successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AuthResponse",
              },
            },
          },
        },
        "401": {
          description: "Invalid refresh token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Invalid or expired refresh token",
                code: "INVALID_REFRESH_TOKEN",
              },
            },
          },
        },
      },
    },
  },

  "/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "User logout",
      description: "Invalidate refresh token and logout user",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                status: "success",
                message: "Logged out successfully",
              },
            },
          },
        },
        "401": {
          $ref: "#/components/responses/UnauthorizedError",
        },
      },
    },
  },

  "/auth/forgot-password": {
    post: {
      tags: ["Authentication"],
      summary: "Request password reset",
      description: "Send password reset email to user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ForgotPasswordRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Password reset email sent",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                status: "success",
                message: "Password reset email sent",
              },
            },
          },
        },
        "400": {
          $ref: "#/components/responses/ValidationError",
        },
        "404": {
          description: "Email not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Email not registered",
                code: "EMAIL_NOT_FOUND",
              },
            },
          },
        },
      },
    },
  },

  "/auth/reset-password": {
    post: {
      tags: ["Authentication"],
      summary: "Reset password",
      description: "Reset user password using reset token",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ResetPasswordRequest",
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Password reset successful",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessResponse",
              },
              example: {
                status: "success",
                message: "Password reset successfully",
              },
            },
          },
        },
        "400": {
          description: "Invalid or expired token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse",
              },
              example: {
                status: "error",
                message: "Invalid or expired reset token",
                code: "INVALID_RESET_TOKEN",
              },
            },
          },
        },
      },
    },
  },
};
