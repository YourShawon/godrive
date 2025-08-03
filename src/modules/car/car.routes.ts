import express from "express";
import { getCar } from "./controllers/getCar.controller.js";

const router = express.Router();

// GET /cars/:id - Get a single car
router.get("/:id", getCar);

export default router;
