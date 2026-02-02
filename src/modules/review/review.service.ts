import { prisma } from "../../utils/db";
import { ApiError } from "../../utils/api-error";
import { CREATE_REVIEW } from "../../schema/review";

class ReviewService {
  async addReview(userId: string, payload: CREATE_REVIEW) {
    const { medicineId, rating, comment } = payload;

    const deliveredOrder = await prisma.order.findFirst({
      where: {
        customerId: userId,
        status: "DELIVERED",
        items: {
          some: { medicineId: payload.medicineId },
        },
      },
    });

    if (!deliveredOrder) {
      throw new ApiError(
        403,
        "You can only review medicines you have purchased and received.",
      );
    }

    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });

    if (!medicine) {
      throw new ApiError(404, "Medicine not found");
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId, medicineId },
    });

    if (existingReview) {
      throw new ApiError(409, " You have already reviewed this medicine");
    }

    const review = await prisma.review.create({
      data: {
        userId,
        medicineId,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return review;
  }

  async getReviews(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { status: "ACTIVE" } }),
      prisma.review.findMany({
        where: { status: "ACTIVE" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
          medicine: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
  async getMedicineReviews(medicineId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { medicineId, status: "ACTIVE" } }),
      prisma.review.findMany({
        where: { medicineId, status: "ACTIVE" },
        skip,
        take: limit,
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
  async updateReview(reviewId: string, payload: Partial<CREATE_REVIEW>) {
    const isExist = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!isExist) throw new ApiError(404, "Review not found");

    return await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: payload.rating ?? isExist.rating,
        comment: payload.comment ?? isExist.comment,
      },
    });
  }

  async updateStatus(reviewId: string, status: "ACTIVE" | "INACTIVE") {
    return await prisma.review.update({
      where: { id: reviewId },
      data: { status },
    });
  }
}

export default ReviewService;
