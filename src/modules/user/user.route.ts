import { Router } from "express";
import UserController from "./user.controller";
import { rateLimiter } from "../../middlewares/rateLimit.middleware";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const userRouter = Router();
const userController = new UserController();

userRouter.get(
  "/",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),

  userController.getUsers,
);
userRouter.get(
  "/:userId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),

  userController.getUser,
);
userRouter.put(
  "/:userId",
  rateLimiter,
  authenticate,
  authorize(["ADMIN"]),

  userController.updateUser,
);

export default userRouter;
