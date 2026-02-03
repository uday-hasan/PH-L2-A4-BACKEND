import { NextFunction, Request, Response } from "express";
import CartService from "./cart.service";
import { ResponseUtil } from "../../utils/response.util";
import { addToCartSchema } from "../../schema/cart";
import { ApiError } from "../../utils/api-error";

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
  async updateQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        throw new ApiError(400, "Quantity must be at least 1");
      }

      const result = await cartService.updateItemQuantity(
        itemId as string,
        quantity,
      );
      return ResponseUtil.success(res, result, "Cart updated successfully");
    } catch (error) {
      next(error);
    }
  }
}

export default CartController;
