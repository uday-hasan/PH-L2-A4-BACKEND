import { prisma } from "../../utils/db";
import { ApiError } from "../../utils/api-error";

class OrderService {
  // order.service.ts
  async placeOrder(customerId: string, payload: { shippingAddress: string }) {
    return await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { customerId },
        include: { items: { include: { medicine: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty");
      }

      let totalAmount = 0;
      const orderItemsData = [];

      for (const cartItem of cart.items) {
        const medicine = cartItem.medicine;

        if (medicine.status !== "ACTIVE") {
          throw new ApiError(400, `${medicine.name} is no longer available`);
        }

        if (medicine.available_quantity < cartItem.quantity) {
          throw new ApiError(400, `Insufficient stock for ${medicine.name}`);
        }

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
        include: { items: true },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

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

  async getSellerOrders(sellerId: string) {
    return await prisma.orderItem.findMany({
      where: { medicine: { seller_id: sellerId } },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            shippingAddress: true,
            createdAt: true,
            customer: { select: { name: true } },
          },
        },
        medicine: true,
      },
      orderBy: { order: { createdAt: "desc" } },
    });
  }

  async updateOrderStatus(orderId: string, status: any) {
    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: { status },
      });
    } catch (error) {
      throw new ApiError(400, "Could not update order status");
    }
  }
  async getAllOrders() {
    try {
      return await prisma.order.findMany({
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            include: {
              medicine: {
                select: {
                  name: true,
                  seller: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new ApiError(500, "Failed to fetch all orders", error);
    }
  }
}

export default OrderService;
