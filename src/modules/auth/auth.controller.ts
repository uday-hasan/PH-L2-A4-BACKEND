import { NextFunction, Request, Response } from "express";
import { REGISTER_USER, registerUserSchema } from "../../schema/user";
import { ApiError } from "../../utils/ApiError";
import AuthService from "./auth.service";
import * as z from "zod";

const authService = new AuthService();
class AuthController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = req.body;
      const data = registerUserSchema.safeParse(payload);
      if (data.error) {
        console.log(data.error.issues);
        const pretty = z.prettifyError(data.error);
        const message = data.error.issues
          .map((issue) => issue.message + " " + "for " + issue.path.join("."))
          .join(", ");

        // console.log({ pretty: pretty.split("+").slice(2).join(" ") });
        return res.status(400).json(new ApiError(400, message));
      }
      const result = await authService.registerUser(data.data);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
