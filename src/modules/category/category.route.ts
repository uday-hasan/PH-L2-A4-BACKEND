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
categoryRouter.get("/", rateLimiter, categoryController.getCategories);
categoryRouter.get("/:categoryId", rateLimiter, categoryController.getCategory);
categoryRouter.put(
  "/:categoryId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  categoryController.updateCategory,
);

export default categoryRouter;
