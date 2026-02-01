import { Router } from "express";
import AuthController from "./auth.controller";
import {
  authRateLimiter,
  rateLimiter,
} from "../../middlewares/rateLimit.middleware";
import { authenticate } from "../../middlewares/auth.middleware";

const authRouter = Router();
const authController = new AuthController();

authRouter.post("/register", authRateLimiter, authController.registerUser);
authRouter.post("/login", authRateLimiter, authController.loginUser);
authRouter.post("/refresh", authController.refresh);
authRouter.get("/me", rateLimiter, authenticate, authController.getMe);
authRouter.post("/logout", rateLimiter, authenticate, authController.logout);

export default authRouter;
