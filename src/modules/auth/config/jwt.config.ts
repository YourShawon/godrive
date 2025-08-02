/**
 * JWT Token Configuration
 *
 * Central configuration for JWT token generation and validation
 * Includes security settings and token expiration policies
 */

/**
 * JWT Configuration Interface
 */
export interface JWTConfig {
  accessToken: {
    secret: string;
    expiresIn: string; // Use string for JWT library compatibility
    algorithm: string;
    issuer: string;
    audience: string;
  };
  refreshToken: {
    secret: string;
    expiresIn: string; // Use string for JWT library compatibility
    algorithm: string;
    issuer: string;
    audience: string;
  };
}

/**
 * Default JWT Configuration
 * Uses environment variables with secure fallbacks
 */
export const jwtConfig: JWTConfig = {
  accessToken: {
    secret:
      process.env.JWT_ACCESS_SECRET ||
      "your-super-secret-access-key-change-in-production",
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m", // 15 minutes
    algorithm: "HS256",
    issuer: process.env.JWT_ISSUER || "godrive-api",
    audience: process.env.JWT_AUDIENCE || "godrive-client",
  },
  refreshToken: {
    secret:
      process.env.JWT_REFRESH_SECRET ||
      "your-super-secret-refresh-key-change-in-production",
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d", // 7 days
    algorithm: "HS256",
    issuer: process.env.JWT_ISSUER || "godrive-api",
    audience: process.env.JWT_AUDIENCE || "godrive-client",
  },
};

/**
 * Token Expiration Times (in seconds)
 */
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: 15 * 60, // 15 minutes
  REFRESH_TOKEN: 7 * 24 * 60 * 60, // 7 days
  RESET_TOKEN: 60 * 60, // 1 hour
  VERIFICATION_TOKEN: 24 * 60 * 60, // 24 hours
} as const;

/**
 * Validate JWT configuration on startup
 */
export function validateJWTConfig(): void {
  // Check for production secrets
  if (process.env.NODE_ENV === "production") {
    if (
      jwtConfig.accessToken.secret.includes("change-in-production") ||
      jwtConfig.refreshToken.secret.includes("change-in-production")
    ) {
      throw new Error(
        "Production JWT secrets must be set via environment variables"
      );
    }
  }

  // Ensure secrets are different
  if (jwtConfig.accessToken.secret === jwtConfig.refreshToken.secret) {
    console.warn(
      "⚠️  Access and refresh token secrets should be different for better security"
    );
  }

  // Ensure minimum secret length
  const minSecretLength = 32;
  if (
    jwtConfig.accessToken.secret.length < minSecretLength ||
    jwtConfig.refreshToken.secret.length < minSecretLength
  ) {
    console.warn(
      `⚠️  JWT secrets should be at least ${minSecretLength} characters long`
    );
  }
}
