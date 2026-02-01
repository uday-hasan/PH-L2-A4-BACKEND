import { Response } from "express";
import { ApiResponse } from "../types";

export class ResponseUtil {
  static success<T>(res: Response, data: T, message: string, statusCode = 200) {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, error: string, statusCode = 400) {
    const response: ApiResponse = {
      success: false,
      message: error,
    };
    return res.status(statusCode).json(response);
  }

  static validationError(res: Response, errors: Record<string, string[]>) {
    const response: ApiResponse = {
      success: false,
      error: "Validation failed",
      errors,
    };
    return res.status(422).json(response);
  }
}
