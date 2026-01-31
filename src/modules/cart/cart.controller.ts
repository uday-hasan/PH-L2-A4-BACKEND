import { NextFunction, Request, Response } from "express";
import CartService from "./cart.service";
import { ResponseUtil } from "../../utils/response.util";
import { addToCartSchema } from "../../schema/cart";

const cartService = new CartService();

class CartController {
  async getMyCart(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await cartService.getCart(req.user!.id);
      ResponseUtil.success(res, result, "Cart fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const data = addToCartSchema.safeParse(req.body);
      if (data.error) {
        next(data.error);
        return;
      }
      const result = await cartService.addToCart(
        req.user!.id,
        data.data.medicineId,
        data.data.quantity,
      );
      ResponseUtil.success(res, result, "Item added to cart");
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params as { itemId: string };
      await cartService.removeItem(itemId);
      ResponseUtil.success(res, null, "Item removed from cart");
    } catch (error) {
      next(error);
    }
  }
}

export default CartController;
