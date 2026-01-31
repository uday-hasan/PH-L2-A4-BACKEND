import { CREATE_MEDICINE } from "../../schema/medicine";
import { LOGIN_USER, REGISTER_USER } from "../../schema/user";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";
import { comparePassword, hashPassword } from "../../utils/hashing";
import { generateAccessToken, verifyRefreshToken } from "../../utils/jwt";

class MedicineService {
  async addMedicine(payload: CREATE_MEDICINE) {
    try {
      const {
        name,
        description,
        category,
        seller_id,
        selling_price,
        purchase_price,
        status,
        available_quantity,
      } = payload;
      const isExist = await prisma.medicine.findUnique({ where: { name } });
      if (isExist) {
        throw new ApiError(409, "Medicine already exists");
      }
      const newMedicine = await prisma.medicine.create({
        data: {
          name,
          description,
          category_id: category,
          seller_id,
          selling_price,
          purchase_price,
          status,
          available_quantity,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          category: true,
        },
        omit: {
          seller_id: true,
          category_id: true,
        },
      });
      if (!newMedicine) {
        throw new ApiError(400, "Medicine creation failed");
      }
      return newMedicine;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }

  async getMedicines() {
    try {
      const medicines = await prisma.medicine.findMany({
        where: { status: "ACTIVE" },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          category: true,
        },
      });
      if (!medicines) {
        throw new ApiError(400, "Medicine retrieval failed");
      }
      return medicines;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
  async getMedicine(medicine_id: string) {
    try {
      const medicine = await prisma.medicine.findUnique({
        where: { id: medicine_id },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          category: true,
        },
      });
      if (!medicine) {
        throw new ApiError(400, "Medicine retrieval failed");
      }
      return medicine;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }

  async updateMedicine(
    payload: Omit<CREATE_MEDICINE & { id: string }, "seller_id">,
  ) {
    try {
      const { id } = payload;
      const isExist = await prisma.medicine.findUnique({ where: { id } });
      if (!isExist) {
        throw new ApiError(400, "Medicine retrieval failed");
      }
      const newMedicine = await prisma.medicine.update({
        where: { id: isExist?.id! },
        data: {
          name: payload?.name || isExist?.name!,
          description: payload?.description || isExist?.description || "",
          category_id: payload?.category || isExist?.category_id!,
          selling_price: payload?.selling_price || isExist?.selling_price!,
          purchase_price: payload?.purchase_price || isExist?.purchase_price!,
          status: payload?.status || isExist?.status!,
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          category: true,
        },
        omit: {
          seller_id: true,
          category_id: true,
        },
      });
      if (!newMedicine) {
        throw new ApiError(400, "Medicine creation failed");
      }
      return newMedicine;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
  async updateStock(payload: { id: string; available_quantity: number }) {
    try {
      const { id, available_quantity } = payload;
      const isExist = await prisma.medicine.findUnique({ where: { id } });
      if (!isExist) {
        throw new ApiError(400, "Medicine retrieval failed");
      }
      const newMedicine = await prisma.medicine.update({
        where: { id: isExist?.id! },
        data: {
          available_quantity: {
            increment: available_quantity,
          },
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              userType: true,
            },
          },
          category: true,
        },
        omit: {
          seller_id: true,
          category_id: true,
        },
      });
      if (!newMedicine) {
        throw new ApiError(400, "Medicine stock update failed");
      }
      return newMedicine;
    } catch (error) {
      throw new ApiError(
        500,
        error instanceof Error ? error.message : "Internal server error",
        error,
      );
    }
  }
}

export default MedicineService;
