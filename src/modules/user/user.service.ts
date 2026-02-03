import { Prisma } from "@prisma/client";
import { LOGIN_USER, REGISTER_USER, USER } from "../../schema/user";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";

class UserService {
  async getSuppliers() {
    try {
      return await prisma.user.findMany({
        where: {
          userType: "SELLER",
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      });
    } catch (error) {
      throw new ApiError(500, "Failed to fetch suppliers");
    }
  }
  async getUsers(params: {
    status?: "ACTIVE" | "INACTIVE" | undefined;
    page: number;
    limit: number;
    search: string;
  }) {
    const { status, page, limit, search } = params;
    const skip = (page - 1) * limit;

    try {
      const whereCondition: any = {
        userType: { not: "ADMIN" },
        ...(status && { status }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [total, users] = await Promise.all([
        prisma.user.count({ where: whereCondition }),
        prisma.user.findMany({
          where: whereCondition,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          omit: { password: true },
        }),
      ]);

      return {
        users,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      throw new ApiError(500, "Internal server error");
    }
  }
  async getUser({ id }: { id: string }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        omit: {
          password: true,
        },
      });
      if (!user) {
        throw new ApiError(404, "User does not exist");
      }
      return user;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
  async updateUser(id: string, payload: Omit<USER, "password">) {
    try {
      const isExist = await prisma.user.findUnique({ where: { id } });
      if (!isExist) {
        throw new ApiError(404, "User does not exist");
      }
      const newUser = await prisma.user.update({
        where: { id },
        data: {
          name: payload?.name || isExist.name,
          email: payload?.email || isExist.email,
          userType: payload?.userType || isExist.userType,
          status: payload?.status || isExist.status,
        },
      });
      if (!newUser) {
        throw new ApiError(400, "User updatation failed");
      }
      const { password: _, ...user } = newUser;
      return user;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
}

export default UserService;
