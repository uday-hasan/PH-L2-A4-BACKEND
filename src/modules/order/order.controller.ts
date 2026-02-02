import { NextFunction, Request, Response } from "express";
import OrderService from "./order.service";
import { placeOrderSchema } from "../../schema/order";
import { ResponseUtil } from "../../utils/response.util";

const orderService = new OrderService();

class OrderController {
  async placeOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const data = placeOrderSchema.safeParse(req.body);
      if (!data.success) return next(data.error);
      const result = await orderService.placeOrder(req.user!.id, data.data);
      ResponseUtil.success(res, result, "Order placed successfully");
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getCustomerOrders(req.user!.id);
      ResponseUtil.success(res, result, "Orders fetched");
    } catch (error) {
      next(error);
    }
  }

  async getIncomingOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getSellerOrders(req.user!.id);
      ResponseUtil.success(res, result, "Seller items fetched");
    } catch (error) {
      next(error);
    }
  }

  async updateOrderItemStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderItemId } = req.params;
      const { status } = req.body;
      const result = await orderService.updateOrderItemStatus(
        req.user!.id,
        orderItemId as string,
        status,
      );
      ResponseUtil.success(res, result, "Item status updated");
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const result = await orderService.updateOrderStatus(
        orderId as string,
        status,
      );
      ResponseUtil.success(res, result, "Global order status updated");
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await orderService.getAllOrders();
      ResponseUtil.success(res, result, "All system orders fetched");
    } catch (error) {
      next(error);
    }
  }
}

export default OrderController;
