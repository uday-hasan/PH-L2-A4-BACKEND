import { NextFunction, Request, Response } from "express";
import {
  loginUserSchema,
  REGISTER_USER,
  registerUserSchema,
  userSchema,
} from "../../schema/user";
import AuthService from "./user.service";
import { ResponseUtil } from "../../utils/response.util";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

const authService = new AuthService();
class USERController {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as "ACTIVE" | "INACTIVE" | undefined;
      const statusObj = status ? { status } : {};
      const result = await authService.getUsers(statusObj);

      return ResponseUtil.success(res, result, "Users fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.userId;
      const result = await authService.getUser({ id: id as string });
      return ResponseUtil.success(res, result, "User fetched successfully");
    } catch (error) {
      next(error);
    }
  }
  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.userId;
      const result = await authService.updateUser(id as string, req.body);
      return ResponseUtil.success(res, result, "User updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default USERController;
