import { Router } from "express";

const authRouter = Router();

authRouter.post("/register", (req, res) => {
  console.log("Register endpoint hit");
});
