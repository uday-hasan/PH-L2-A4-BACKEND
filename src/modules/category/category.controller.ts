import { NextFunction, Request, Response } from "express";
import CategoryService from "./category.service";
import { createCategorySchema } from "../../schema/category";
import { ResponseUtil } from "../../utils/response.util";

const categoryService = new CategoryService();

class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = createCategorySchema.safeParse(req.body);
      if (payload.error) {
        next(payload.error);
        return;
      }
      const category = await categoryService.createCategory(payload.data);
      ResponseUtil.success(res, category, "Category created successfully");
    } catch (error) {
      next(error);
    }
  }
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = (req.query.search as string) || "";

      const result = await categoryService.getCategories(page, limit, search);
      ResponseUtil.success(res, result, "Categories fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId: id } = req.params;
      const category = await categoryService.getCategory(id as string);
      ResponseUtil.success(res, category, "Category fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId: id } = req.params;
      const payload = createCategorySchema.partial().safeParse(req.body);
      if (payload.error) {
        next(payload.error);
        return;
      }
      const category = await categoryService.updateCategory(id as string, {
        name: req.body.name,
        status: req.body.status,
        description: req.body.description,
      });
      ResponseUtil.success(res, category, "Category updated successfully");
    } catch (error) {
      next(error);
    }
  }
}
export default CategoryController;
