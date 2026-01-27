import { Router } from "express";
import AuthController from "./auth.controller";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware";

const authRouter = Router();
const authController = new AuthController();
authRouter.post("/register", authRateLimiter, authController.registerUser);
authRouter.post("/login", authRateLimiter, authController.loginUser);

export default authRouter;
