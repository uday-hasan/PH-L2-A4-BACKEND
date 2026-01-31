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
  async getCategories() {
    try {
      const categories = await prisma.category.findMany();
      return categories;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
  async getCategory(id: string) {
    try {
      const category = await prisma.category.findUnique({
        where: {
          id,
        },
      });
      if (!category) {
        throw new ApiError(404, "Category not found");
      }
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
