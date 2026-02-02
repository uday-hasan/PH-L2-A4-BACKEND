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
  // category.service.ts
  async getCategories(
    page: number = 1,
    limit: number = 8,
    search: string = "",
  ) {
    try {
      const skip = (page - 1) * limit;

      // Search filter
      const where = search
        ? { name: { contains: search, mode: "insensitive" as any } }
        : {};

      const [total, categories] = await Promise.all([
        prisma.category.count({ where }),
        prisma.category.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            _count: true,
          },
        }),
      ]);

      return {
        categories,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ApiError(500, "Failed to fetch categories");
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
  async updateCategory(id: string, payload: CREATE_CATEGORY) {
    try {
      const category = await prisma.category.findUnique({
        where: {
          id,
        },
      });
      if (!category) {
        throw new ApiError(404, "Category not found");
      }
      const updatedCategory = await prisma.category.update({
        where: { id },
        data: {
          name: payload?.name || category.name,
          status: payload?.status || category.status,
          description: payload?.description || category.description,
        },
      });
      if (!updatedCategory) {
        throw new ApiError(400, "Failed to update category");
      }
      return updatedCategory;
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
