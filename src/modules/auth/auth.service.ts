import { LOGIN_USER, REGISTER_USER } from "../../schema/user";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";
import { comparePassword, hashPassword } from "../../utils/hashing";
import { generateAccessToken, verifyRefreshToken } from "../../utils/jwt";

class AuthService {
  async registerUser(payload: REGISTER_USER) {
    try {
      const { name, email, password, userType } = payload;
      const isExist = await prisma.user.findUnique({ where: { email } });
      if (isExist) {
        throw new ApiError(409, "User already exists");
      }
      const hash = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hash,
          userType,
        },
      });
      if (!newUser) {
        throw new ApiError(400, "User creation failed");
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
  async loginUser(payload: LOGIN_USER) {
    try {
      const { email, password } = payload;
      const isExist = await prisma.user.findUnique({ where: { email } });
      if (!isExist) {
        throw new ApiError(404, "User does not exist");
      }
      const isValidPassword = await comparePassword(password, isExist.password);
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid password");
      }

      if (!isExist) {
        throw new ApiError(400, "User creation failed");
      }
      const { password: _, ...user } = isExist;
      return user;
    } catch (error) {
      throw new ApiError(
        error instanceof ApiError ? error.statusCode : 500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new ApiError(401, "User not found");
      }
      const newAccessToken = generateAccessToken({
        userId: user.id,
        userType: user.userType,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new ApiError(401, "Session expired or invalid token");
    }
  }

  async getMe(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        omit: {
          password: true,
        },
      });

      if (!user) {
        throw new ApiError(404, "User not found");
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
}

export default AuthService;
