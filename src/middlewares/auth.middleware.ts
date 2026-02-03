import { NextFunction, Request, Response } from "express";
import { ResponseUtil } from "../utils/response.util";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/jwt";
import { prisma } from "../utils/db";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Hitting authn");
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const payload = verifyAccessToken(token);
    const { userId } = payload;

    const getUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!getUser) {
      throw new ApiError(401, "User not found");
    }
    req.user = getUser;

    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      ResponseUtil.error(res, error.message, error.statusCode);
      return;
    }

    ResponseUtil.error(res, "Invalid or expired token", 401);
    return;
  }
};

export const authorize =
  (roles: ("ADMIN" | "CUSTOMER" | "SELLER")[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Authentication required");
      }

      const payload = verifyAccessToken(token);
      const { userId } = payload;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ApiError(401, "User not found");
      }

      if (!roles.includes(user.userType)) {
        throw new ApiError(
          403,
          "You are not authorized to access this resource",
        );
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof ApiError) {
        ResponseUtil.error(res, error.message, error.statusCode);
        return;
      }

      ResponseUtil.error(res, "Invalid or expired token", 401);
    }
  };

export const authorizeOwner =
  (model: "medicine" | "review") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const resourceId = req.params[model + "Id"];

      if (!resourceId) {
        throw new ApiError(400, "Resource id is required");
      }

      if (user.userType === "ADMIN") {
        return next();
      }

      const ownerFieldMap: Record<string, string> = {
        medicine: "seller_id",
        review: "userId",
      };
      const ownerField = ownerFieldMap[model];

      const resource = await (prisma[model] as any).findUnique({
        where: { id: resourceId },
      });

      if (!resource) {
        throw new ApiError(404, `${model} not found`);
      }

      if (resource[ownerField!] !== user.id) {
        throw new ApiError(
          403,
          `You do not have permission to access this ${model}`,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
