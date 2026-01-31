import { Router } from "express";
import UserController from "./user.controller";
import {
  authRateLimiter,
  rateLimiter,
} from "../../middlewares/rateLimit.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.get(
  "/",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  authRateLimiter,
  userController.getUsers,
);
userRouter.get(
  "/:userId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  authRateLimiter,
  userController.getUser,
);
userRouter.put(
  "/:userId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),
  authRateLimiter,
  userController.updateUser,
);

export default userRouter;
