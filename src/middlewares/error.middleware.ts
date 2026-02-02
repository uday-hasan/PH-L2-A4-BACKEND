import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ResponseUtil } from "../utils/response.util";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/api-error";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    err.issues.forEach((error) => {
      const path = error.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(error.message);
    });
    return ResponseUtil.validationError(res, errors);
  }
  if (err instanceof ApiError) {
    return ResponseUtil.error(res, err.message, err.statusCode);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return ResponseUtil.error(res, "Record already exists", 409);
    }
    if (err.code === "P2025") {
      return ResponseUtil.error(res, "Record not found", 404);
    }
  }

  console.error("❌ Unhandled Error:", err);

  return ResponseUtil.error(
    res,
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
    500,
  );
};
