import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  // API Configuration
  api: {
    version: "1.0.0",
    prefix: "/api/v1",
  },

  // JWT Configuration
  jwt: {
    accessTokenSecret:
      process.env.JWT_ACCESS_SECRET || "your-access-secret-key",
    refreshTokenSecret:
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key",
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || "",
  },
};
