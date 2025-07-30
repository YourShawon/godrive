import express from "express";
import { validateRequest } from "./middlewares/validation.js";
import { userValidation } from "./schemas/user.schemas.js";
import { createSuccessResponse } from "./utils/responses.js";
import {
  correlationMiddleware,
  httpLogger,
  errorHandler,
} from "./middlewares/index.js";

const app = express();

// Apply middleware stack
app.use(express.json());
app.use(correlationMiddleware);
app.use(httpLogger);

// Test route for GET /users/:id validation
app.get("/users/:id", validateRequest(userValidation.getUser), (req, res) => {
  res.json(
    createSuccessResponse(
      "User validation successful",
      {
        userId: req.params.id,
        traceId: req.traceId,
      },
      req.traceId
    )
  );
});

// Test route for POST /users validation
app.post("/users", validateRequest(userValidation.createUser), (req, res) => {
  res.status(201).json(
    createSuccessResponse(
      "User creation validation successful",
      {
        userData: req.body,
        traceId: req.traceId,
      },
      req.traceId
    )
  );
});

// Test route for GET /users with query validation
app.get("/users", validateRequest(userValidation.getUsers), (req, res) => {
  res.json(
    createSuccessResponse(
      "Users query validation successful",
      {
        query: req.query,
        traceId: req.traceId,
      },
      req.traceId
    )
  );
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🎯 Validation Test Server running on port ${PORT}`);
  console.log("\n📋 Test these endpoints:");
  console.log(`  GET  http://localhost:${PORT}/users/507f1f77bcf86cd799439011`);
  console.log(
    `  GET  http://localhost:${PORT}/users?page=1&limit=10&role=admin`
  );
  console.log(`  POST http://localhost:${PORT}/users`);
  console.log("\n📝 Example POST body:");
  console.log(
    JSON.stringify(
      {
        email: "test@example.com",
        password: "SecurePass123!",
        firstName: "John",
        lastName: "Doe",
      },
      null,
      2
    )
  );
});
