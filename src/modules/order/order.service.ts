import { prisma } from "../../utils/db";
import { ApiError } from "../../utils/api-error";
import { CREATE_ORDER } from "../../schema/order";

class OrderService {
  async placeOrder(customerId: string, payload: CREATE_ORDER) {
    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of payload.items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
        });

        if (!medicine || medicine.status !== "ACTIVE") {
          throw new ApiError(
            404,
            `Medicine ${item.medicineId} not found or inactive`,
          );
        }

        if (medicine.available_quantity < item.quantity) {
          throw new ApiError(400, `Insufficient stock for ${medicine.name}`);
        }
        totalAmount += medicine.selling_price * item.quantity;

        orderItemsData.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: medicine.selling_price,
        });

        await tx.medicine.update({
          where: { id: item.medicineId },
          data: { available_quantity: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cart: { customerId } },
      });

      return await tx.order.create({
        data: {
          customerId,
          shippingAddress: payload.shippingAddress,
          totalAmount,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });
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
