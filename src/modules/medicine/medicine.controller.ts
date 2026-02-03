import { NextFunction, Request, Response } from "express";
import {
  loginUserSchema,
  REGISTER_USER,
  registerUserSchema,
} from "../../schema/user";
import AuthService from "./medicine.service";
import { ResponseUtil } from "../../utils/response.util";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";
import MedicineService from "./medicine.service";
import { createMedicineSchema } from "../../schema/medicine";
import { ApiError } from "../../utils/api-error";
import { logger } from "../../utils/logger";

const medicineService = new MedicineService();
class MedicineController {
  async addMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = createMedicineSchema.safeParse(payload);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await medicineService.addMedicine({
        seller_id: req?.user?.id!,
        name: req.body.name,
        description: req.body.description,
        selling_price: req.body.selling_price,
        purchase_price: req.body.purchase_price,
        status: req.body.status,
        available_quantity: req.body.available_quantity,
        category: req.body.category,
      });

      return ResponseUtil.success(res, result, "Medicine Added successfully");
    } catch (error) {
      next(error);
    }
  }

  async getPrivateMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = req.query.search as string;
      const category_id = req.query.category_id as string;
      const user = req?.user;

      const status =
        (req.query.status as string) || (req.user ? undefined : "ACTIVE");

      const result = await medicineService.getPrivateMedicines({
        user,
        status: status as "ACTIVE" | "INACTIVE" | undefined,
        search,
        category_id,
        page,
        limit,
      });
      return ResponseUtil.success(res, result, "Fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async getMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const search = req.query.search as string;
      const category_id = req.query.category_id as string;
      const seller_id = (req.query?.seller_id as string) || undefined;
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;
      const status =
        (req.query.status as string) || (req.user ? undefined : "ACTIVE");

      const result = await medicineService.getMedicines({
        seller_id,
        status: status as "ACTIVE" | "INACTIVE" | undefined,
        search,
        category_id,
        page,
        limit,
        minPrice,
        maxPrice,
      });
      return ResponseUtil.success(res, result, "Fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async getMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const medicine_id = req.params["medicineId"] as string;
      if (!medicine_id) {
        next(new ApiError(400, "Medicine id is required"));
        return;
      }
      const result = await medicineService.getMedicine(medicine_id);
      return ResponseUtil.success(res, result, "Medicine fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async updateMedicine(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = createMedicineSchema.partial().safeParse(payload);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await medicineService.updateMedicine({
        id: req.params.medicineId as string,
        name: req.body.name,
        description: req.body.description,
        selling_price: req.body.selling_price,
        purchase_price: req.body.purchase_price,
        status: req.body.status,
        available_quantity: req.body.available_quantity,
        category: req.body.category,
      });

      return ResponseUtil.success(res, result, "Medicine Added successfully");
    } catch (error) {
      next(error);
    }
  }

  async updateMedicineStock(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = createMedicineSchema
        .pick({ available_quantity: true })
        .safeParse(payload);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await medicineService.updateStock({
        id: req.params.medicineId as string,
        available_quantity: req.body.available_quantity,
      });

      return ResponseUtil.success(
        res,
        result,
        "Medicine stock updated successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default MedicineController;
