import { Router } from "express";
import CategoryController from "./category.controller";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const categoryRouter = Router();

const categoryController = new CategoryController();

categoryRouter.post(
  "/",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  categoryController.createCategory,
);

export default categoryRouter;
