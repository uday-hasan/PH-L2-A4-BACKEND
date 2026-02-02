import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import { ResponseUtil } from "../utils/response.util";

export const validate = (schema: ZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const path = err.path.slice(1).join(".");
          if (!errors[path]) errors[path] = [];
          errors[path].push(err.message);
        });
        ResponseUtil.validationError(res, errors);
        return;
      }
      next(error);
    }
  };
};
