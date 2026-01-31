import { NextFunction, Request, Response } from "express";
import CategoryService from "./category.service";
import { createCategorySchema } from "../../schema/category";

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
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
}

export default CategoryController;
