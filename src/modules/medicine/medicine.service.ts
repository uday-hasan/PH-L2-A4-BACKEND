import { Prisma } from "@prisma/client";
import { CREATE_MEDICINE } from "../../schema/medicine";
import { REQUEST_USER } from "../../schema/user";
import { ApiError } from "../../utils/api-error";
import { prisma } from "../../utils/db";

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

  async getPrivateMedicines(params: {
    user: REQUEST_USER | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
    search?: string;
    category_id?: string;
    page: number;
    limit: number;
  }) {
    const { user, status, search, category_id, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(user?.userType === "SELLER" && { seller_id: user.id }),
      ...(status && { status }),
      ...(category_id && { category_id }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [total, medicines] = await Promise.all([
      prisma.medicine.count({ where }),
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          seller: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      medicines,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
  async getMedicines(params: {
    seller_id?: string | undefined;
    status?: "ACTIVE" | "INACTIVE" | undefined;
    search?: string;
    category_id?: string;
    page: number;
    limit: number;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
  }) {
    const {
      seller_id,
      maxPrice,
      minPrice,
      status,
      search,
      category_id,
      page,
      limit,
    } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.MedicineWhereInput = {
      ...(status && { status }),
      ...(category_id && { category_id }),
      ...(seller_id && { seller_id }),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            selling_price: {
              ...(minPrice !== undefined && { gte: minPrice }),
              ...(maxPrice !== undefined && { lte: maxPrice }),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
              {
                description: {
                  contains: search,
                  mode: "insensitive" as Prisma.QueryMode,
                },
              },
            ],
          }
        : {}),
    };

    const [total, medicines] = await Promise.all([
      prisma.medicine.count({ where }),
      prisma.medicine.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          seller: { select: { name: true, email: true } },
          reviews: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      medicines,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
          reviews: {
            include: {
              user: true,
            },
          },
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
