import express from "express";
import { getCar } from "./controllers/getCar.controller.js";
import { validateParams } from "./middleware/validation.middleware.js";
import { CarIdParamsSchema } from "./schemas/car.schemas.js";

const router = express.Router();

// GET /cars/:id - Get a single car (with validation)
router.get("/:id", validateParams(CarIdParamsSchema), getCar);

export default router;
