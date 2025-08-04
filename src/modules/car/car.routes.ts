import express from "express";
import { getCar } from "./controllers/getCar.controller.js";
import { listCars } from "./controllers/listCars.controller.js";
import {
  validateParams,
  validateQuery,
} from "./middleware/validation.middleware.js";
import { CarIdParamsSchema } from "./schemas/car.schemas.js";
import { ListCarsQuerySchema } from "./schemas/listCars.schemas.js";

const router = express.Router();

// GET /cars - List cars with query parameters (must come before /:id route)
router.get("/", validateQuery(ListCarsQuerySchema), listCars);

// GET /cars/:id - Get a single car (with validation)
router.get("/:id", validateParams(CarIdParamsSchema), getCar);

export default router;
