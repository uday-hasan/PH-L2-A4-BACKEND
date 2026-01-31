import { Router } from "express";
import CartController from "./cart.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const cartRouter = Router();
const cartController = new CartController();

cartRouter.get(
  "/",
  authenticate,
  authorize(["CUSTOMER"]),
  cartController.getMyCart,
);
cartRouter.post(
  "/add",
  authenticate,
  authorize(["CUSTOMER"]),
  cartController.addItem,
);
cartRouter.delete(
  "/item/:itemId",
  authenticate,
  authorize(["CUSTOMER"]),
  cartController.removeItem,
);

export default cartRouter;
