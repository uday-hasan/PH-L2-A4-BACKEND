import { Prisma } from "../../generated/prisma/client";
import { LOGIN_USER, REGISTER_USER, USER } from "../../schema/user";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";
import { comparePassword, hashPassword } from "../../utils/hashing";
import { generateAccessToken, verifyRefreshToken } from "../../utils/jwt";

class UserService {
  async getUsers({ status }: { status?: "ACTIVE" | "INACTIVE" }) {
    const whereCondition: Prisma.UserWhereInput = {};
    if (status) {
      whereCondition.status = status;
    }
    try {
      const users = await prisma.user.findMany({
        where: whereCondition,
        omit: {
          password: true,
        },
      });
      return users;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
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
