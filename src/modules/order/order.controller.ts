import { NextFunction, Request, Response } from "express";
import OrderService from "./order.service";
import { placeOrderSchema } from "../../schema/order";
import { ResponseUtil } from "../../utils/response.util";

const orderService = new OrderService();

class OrderController {
  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = placeOrderSchema.safeParse(req.body);

      if (!data.success) {
        next(data.error);
        return;
      }
      const result = await orderService.placeOrder(req.user!.id, data.data);
      ResponseUtil.success(res, result, "Order placed successfully (COD)");
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getCustomerOrders(req.user!.id);
      ResponseUtil.success(res, result, "Orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  async getIncomingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getSellerOrders(req.user!.id);
      ResponseUtil.success(res, result, "Incoming orders fetched");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = req.params.orderId as string;
      const { status } = req.body;
      const result = await orderService.updateOrderStatus(orderId, status);
      ResponseUtil.success(res, result, "Order status updated");
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getAllOrders();
      return ResponseUtil.success(
        res,
        result,
        "All system orders fetched successfully",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
