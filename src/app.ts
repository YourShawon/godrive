import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Request, Response, NextFunction } from "express";
import { completeSwaggerConfig } from "@docs/index.js";
import { prisma, checkDatabaseHealth, getDatabaseStatus } from "@config/db.js";
import routes from "./routes/index.js";

class App {
  public app: express.Application;
  private port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private async initializeMiddlewares() {
    // Basic Express middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Initialize database connection
    await this.initializeDatabaseConnection();
  }

  private async initializeDatabaseConnection() {
    try {
      // Connect to database
      await prisma.$connect();
      console.log("✅ Database connected successfully");

      // Test the connection with a simple operation (only if connection succeeds)
      try {
        await prisma.$runCommandRaw({ ping: 1 });
        console.log("✅ Database ping test passed");
      } catch (pingError) {
        console.warn(
          "⚠️  Database ping test failed, but connection established"
        );
        console.warn(
          "Ping error:",
          pingError instanceof Error ? pingError.message : "Unknown error"
        );
      }

      // Setup graceful shutdown handlers
      this.setupGracefulShutdown();
    } catch (error) {
      console.error("❌ Database connection failed:", error);

      if (process.env.NODE_ENV === "production") {
        console.error(
          "❌ Application will exit due to database connection failure"
        );
        process.exit(1);
      } else {
        console.warn(
          "⚠️  Development mode: Continuing without database connection"
        );
        console.warn(
          "⚠️  Database endpoints will return errors until connection is established"
        );
      }
    }
  }

  private setupGracefulShutdown() {
    // Handle graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);

      try {
        // Close database connection
        await prisma.$disconnect();
        console.log("✅ Database connection closed");

        // Exit process
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during graceful shutdown:", error);
        process.exit(1);
      }
    };

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", async (error) => {
      console.error("❌ Uncaught Exception:", error);
      await prisma.$disconnect();
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", async (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
      await prisma.$disconnect();
      process.exit(1);
    });
  }

  private initializeRoutes() {
    // Health check endpoint
    this.app.get("/health", async (req: Request, res: Response) => {
      const dbStatus = getDatabaseStatus();
      const isDbHealthy = await checkDatabaseHealth();

      res.status(200).json({
        status: "success",
        message: "GoDrive API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        database: {
          connected: dbStatus.isConnected,
          healthy: isDbHealthy,
          lastChecked: dbStatus.timestamp,
        },
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
        },
      });
    });

    // Database health check endpoint
    this.app.get("/health/database", async (req: Request, res: Response) => {
      try {
        const isHealthy = await checkDatabaseHealth();
        const dbStatus = getDatabaseStatus();

        if (isHealthy) {
          res.status(200).json({
            status: "success",
            message: "Database is healthy",
            database: {
              connected: dbStatus.isConnected,
              healthy: isHealthy,
              lastChecked: dbStatus.timestamp,
            },
            timestamp: new Date().toISOString(),
          });
        } else {
          res.status(503).json({
            status: "error",
            message: "Database is unhealthy",
            database: {
              connected: dbStatus.isConnected,
              healthy: isHealthy,
              lastChecked: dbStatus.timestamp,
            },
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        res.status(503).json({
          status: "error",
          message: "Database health check failed",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Test API route (temporary)
    this.app.get("/api/v1/test", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "API is working",
        timestamp: new Date().toISOString(),
      });
    });

    // API Documentation
    this.initializeSwagger();

    // API routes
    this.app.use("/api/v1", routes);
  }

  private initializeSwagger() {
    // Use the complete Swagger configuration
    const swaggerSpec = swaggerJSDoc({
      definition: completeSwaggerConfig,
      apis: [], // We define everything in the config files
    });

    // Swagger UI options
    const swaggerOptions = {
      explorer: true,
      customSiteTitle: "GoDrive API Documentation",
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info .title { color: #2563eb }
      `,
      customfavIcon: "/favicon.ico",
    };

    // Serve raw Swagger JSON
    this.app.get("/api-docs.json", (req: Request, res: Response) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerSpec);
    });

    // Serve Swagger documentation
    this.app.use("/api-docs", swaggerUi.serve);
    this.app.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerOptions));

    console.log(
      "📚 Swagger documentation available at: http://localhost:" +
        this.port +
        "/api-docs"
    );
  }

  private initializeErrorHandling() {
    // 404 handler for unknown routes
    this.app.use("*", (req, res) => {
      res.status(404).json({
        status: "error",
        message: `Route ${req.originalUrl} not found`,
        code: "NOT_FOUND",
        timestamp: new Date().toISOString(),
      });
    });

    // Global error handler
    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error("Error:", err);

        res.status(err.status || 500).json({
          status: "error",
          message: err.message || "Internal server error",
          code: err.code || "INTERNAL_ERROR",
          timestamp: new Date().toISOString(),
          ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
      }
    );
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log("🚀 GoDrive API Server Started");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📍 Server running on: http://localhost:${this.port}`);
      console.log(
        `📚 API Documentation: http://localhost:${this.port}/api-docs`
      );
      console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
      console.log(
        `�️  Database Health: http://localhost:${this.port}/health/database`
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  }
}

export default App;
