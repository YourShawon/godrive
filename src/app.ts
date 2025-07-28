import express from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Request, Response, NextFunction } from "express";
import { completeSwaggerConfig } from "@docs/index.js";

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

  private initializeMiddlewares() {
    // Basic Express middlewares
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    // Health check endpoint
    this.app.get("/health", (req: Request, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "GoDrive API is running",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      });
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

    // API routes will go here
    // this.app.use('/api/v1', routes);
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
        `� API Documentation: http://localhost:${this.port}/api-docs`
      );
      console.log(`�📊 Health Check: http://localhost:${this.port}/health`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    });
  }
}

export default App;
