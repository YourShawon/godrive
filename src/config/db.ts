import { PrismaClient, Prisma } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Database configuration
const databaseConfig: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn", "info"]
      : ["error"],

  // Error formatting
  errorFormat: "pretty",
};

// Singleton pattern to avoid multiple Prisma instances
const prisma = globalThis.__prisma || new PrismaClient(databaseConfig);

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Connection monitoring
let isConnected = false;

// Health check function
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    isConnected = true;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    isConnected = false;
    return false;
  }
};

// Get connection status
export const getDatabaseStatus = () => ({
  isConnected,
  timestamp: new Date().toISOString(),
});

// Database connection helper
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    isConnected = true;
    console.log("🗄️  Database connection established");
  } catch (error) {
    isConnected = false;
    console.error("🚫 Database connection failed:", error);
    throw error;
  }
};

// Database disconnection helper
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    isConnected = false;
    console.log("🗄️  Database connection closed");
  } catch (error) {
    console.error("🚫 Database disconnection failed:", error);
    throw error;
  }
};

export { prisma };
