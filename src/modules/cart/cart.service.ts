import { prisma } from "../../utils/db";
import { ApiError } from "../../utils/api-error";

class CartService {
  async getCart(customerId: string) {
    let cart = await prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: { medicine: true },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { customerId },
        include: { items: { include: { medicine: true } } },
      });
    }
    return cart;
  }

  async addToCart(customerId: string, medicineId: string, quantity: number) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: medicineId },
    });
    if (!medicine || medicine.available_quantity < quantity) {
      throw new ApiError(400, "Medicine not available in this quantity");
    }

    const cart = await this.getCart(customerId);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, medicineId },
    });

    if (existingItem) {
      return await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      return await prisma.cartItem.create({
        data: { cartId: cart.id, medicineId, quantity },
      });
    }
  }

  async removeItem(cartItemId: string) {
    return await prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(customerId: string) {
    const cart = await prisma.cart.findUnique({ where: { customerId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
  }
  async updateItemQuantity(cartItemId: string, quantity: number) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { medicine: true },
    });

    if (!cartItem) throw new ApiError(404, "Item not found in cart");
    if (quantity > cartItem.medicine.available_quantity) {
      throw new ApiError(
        400,
        `Only ${cartItem.medicine.available_quantity} units available`,
      );
    }

    return await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
      include: { medicine: true },
    });
  }
}

export default CartService;
