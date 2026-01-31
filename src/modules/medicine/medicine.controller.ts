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

  async getMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await medicineService.getMedicines();
      return ResponseUtil.success(
        res,
        result,
        "Medicines fetched successfully",
      );
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
