import { Router } from "express";
import ReviewController from "./review.controller";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";
import {
  authenticate,
  authorize,
  authorizeOwner,
} from "../../middlewares/auth.middleware";

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get("/", rateLimiter, reviewController.getReviews);
reviewRouter.get(
  "/medicine/:medicineId",
  rateLimiter,
  reviewController.getMedicineReviews,
);

reviewRouter.post(
  "/",
  rateLimiter,
  authenticate,
  authorize(["CUSTOMER"]),
  reviewController.addReview,
);

reviewRouter.put(
  "/:reviewId",
  rateLimiter,
  authenticate,
  authorizeOwner("review"),
  reviewController.updateReview,
);

reviewRouter.patch(
  "/:reviewId/status",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  reviewController.updateReviewStatus,
);

export default reviewRouter;
