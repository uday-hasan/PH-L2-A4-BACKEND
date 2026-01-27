import { NextFunction, Request, Response } from "express";
import {
  loginUserSchema,
  REGISTER_USER,
  registerUserSchema,
} from "../../schema/user";
import AuthService from "./auth.service";
import { ResponseUtil } from "../../utils/response.util";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt";

const authService = new AuthService();
class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = registerUserSchema.safeParse(payload);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await authService.registerUser(data.data);

      return ResponseUtil.success(res, result, "User registered successfully");
    } catch (error) {
      next(error);
    }
  }
  async loginUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = loginUserSchema.safeParse(payload);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await authService.loginUser(data.data);
      const accessToken = generateAccessToken({
        userId: result.id,
        userType: result.userType,
      });
      const refreshToken = generateRefreshToken({
        userId: result.id,
        userType: result.userType,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
      return ResponseUtil.success(res, result, "User logged in successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
