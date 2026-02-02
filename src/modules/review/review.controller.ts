import { NextFunction, Request, Response } from "express";
import ReviewService from "./review.service";
import { ResponseUtil } from "../../utils/response.util";
import { createReviewSchema } from "../../schema/review";
import { ApiError } from "../../utils/api-error";

const reviewService = new ReviewService();

class ReviewController {
  async addReview(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createReviewSchema.safeParse(req.body);
      if (!payload.success) {
        next(payload.error);
        return;
      }

      const result = await reviewService.addReview(req.user!.id, payload.data);
      return ResponseUtil.success(
        res,
        result,
        "Review added successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async getMedicineReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const medicineId = req.params.medicineId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await reviewService.getMedicineReviews(
        medicineId,
        page,
        limit,
      );
      return ResponseUtil.success(res, result, "Fetched reviews successfully");
    } catch (error) {
      next(error);
    }
  }
  async getReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;

      const result = await reviewService.getReviews(page, limit);
      return ResponseUtil.success(res, result, "Fetched reviews successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createReviewSchema.partial().safeParse(req.body);
      if (!payload.success) return next(payload.error);

      const result = await reviewService.updateReview(
        req.params.reviewId as string,
        {
          comment: payload.data.comment as string,
          rating: payload.data.rating as number,
          medicineId: payload.data.medicineId as string,
        },
      );
      return ResponseUtil.success(res, result, "Review updated successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateReviewStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) throw new ApiError(400, "Status is required");

      const result = await reviewService.updateStatus(
        req.params.reviewId as string,
        status,
      );
      return ResponseUtil.success(res, result, "Review status updated");
    } catch (error) {
      next(error);
    }
  }
}

export default ReviewController;
