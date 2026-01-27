import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";
import { AppError } from "./error.middleware";
import { ResponseUtil } from "../utils/response.util";
import { JwtUtil } from "../utils/jwt.util";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError(401, "Authentication required");
    }

    const payload = JwtUtil.verifyAccessToken(token);
    req.user = payload;

    return next();
  } catch (error) {
    if (error instanceof AppError) {
      ResponseUtil.error(res, error.message, error.statusCode);
      return;
    }

    ResponseUtil.error(res, "Invalid or expired token", 401);
    return;
  }
};
