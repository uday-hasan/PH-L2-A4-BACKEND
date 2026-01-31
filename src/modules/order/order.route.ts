import { Router } from "express";
import OrderController from "./order.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

const orderRouter = Router();
const orderController = new OrderController();

orderRouter.get(
  "/admin/all",
  authenticate,
  authorize(["ADMIN"]),
  orderController.getAllOrders,
);

orderRouter.post(
  "/",
  authenticate,
  authorize(["CUSTOMER"]),
  orderController.placeOrder,
);
orderRouter.get(
  "/my-orders",
  authenticate,
  authorize(["CUSTOMER"]),
  orderController.getMyOrders,
);

orderRouter.get(
  "/incoming",
  authenticate,
  authorize(["SELLER"]),
  orderController.getIncomingOrders,
);
orderRouter.patch(
  "/status/:orderId",
  authenticate,
  authorize(["SELLER", "ADMIN"]),
  orderController.updateStatus,
);

export default orderRouter;
