import { REGISTER_USER } from "../../schema/user";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { prisma } from "../../utils/db";
import { hashPassword } from "../../utils/hashing";

class AuthService {
  async registerUser(payload: REGISTER_USER) {
    try {
      const { name, email, password, userType } = payload;
      const isExist = await prisma.user.findUnique({ where: { email } });
      if (isExist) {
        return new ApiError(409, "User already exists");
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
        return new ApiError(400, "User creation failed");
      }
      const { password: _, ...user } = newUser;
      return new ApiResponse(201, "User registered successfully", {
        data: user,
      });
    } catch (error) {
      return new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
}

export default AuthService;
