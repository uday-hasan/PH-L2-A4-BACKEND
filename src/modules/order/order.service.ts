import { prisma } from "../../utils/db";
import { ApiError } from "../../utils/api-error";
import { ORDER_STATUS } from "../../generated/prisma/enums";

class OrderService {
  async placeOrder(customerId: string, payload: { shippingAddress: string }) {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { customerId },
        include: { items: { include: { medicine: true } } },
      });

      if (!cart || cart.items.length === 0)
        throw new ApiError(400, "Your cart is empty");

      let totalAmount = 0;
      const orderItemsData = [];

      for (const cartItem of cart.items) {
        const medicine = cartItem.medicine;
        if (medicine.status !== "ACTIVE")
          throw new ApiError(400, `${medicine.name} is inactive`);
        if (medicine.available_quantity < cartItem.quantity)
          throw new ApiError(400, `No stock for ${medicine.name}`);

        totalAmount += medicine.selling_price * cartItem.quantity;
        orderItemsData.push({
          medicineId: medicine.id,
          quantity: cartItem.quantity,
          price: medicine.selling_price,
        });

        await tx.medicine.update({
          where: { id: medicine.id },
          data: { available_quantity: { decrement: cartItem.quantity } },
        });
      }

      const order = await tx.order.create({
        data: {
          customerId,
          shippingAddress: payload.shippingAddress,
          totalAmount,
          items: { create: orderItemsData },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  async getCustomerOrders(customerId: string) {
    return await prisma.order.findMany({
      where: { customerId },
      include: { items: { include: { medicine: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllOrders() {
    return await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        items: {
          include: {
            medicine: {
              select: { name: true, seller: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateOrderStatus(orderId: string, status: ORDER_STATUS) {
    return await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async getSellerOrders(sellerId: string) {
    return await prisma.orderItem.findMany({
      where: { medicine: { seller_id: sellerId } },
      include: {
        medicine: true,
        order: {
          include: { customer: { select: { name: true, email: true } } },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });
  }

  async updateOrderItemStatus(
    sellerId: string,
    orderItemId: string,
    status: ORDER_STATUS,
  ) {
    const item = await prisma.orderItem.findFirst({
      where: { id: orderItemId, medicine: { seller_id: sellerId } },
    });

    if (!item) throw new ApiError(403, "You don't own this product");

    return await prisma.orderItem.update({
      where: { id: orderItemId },
      data: { status },
    });
  }
}

export default OrderService;
