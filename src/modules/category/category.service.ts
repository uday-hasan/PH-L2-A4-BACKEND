import { CREATE_CATEGORY } from "../../schema/category";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";

class CategoryService {
  async createCategory(payload: CREATE_CATEGORY) {
    try {
      const isExist = await prisma.category.findUnique({
        where: {
          name: payload.name,
        },
      });
      if (isExist) {
        throw new ApiError(400, "Category with this name already exists");
      }
      const category = await prisma.category.create({
        data: payload,
      });
      return category;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
}

export default CategoryService;
