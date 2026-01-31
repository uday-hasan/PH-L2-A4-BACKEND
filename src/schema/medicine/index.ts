import * as z from "zod";
import { userSchema } from "../user/index";
const medicineSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  seller: userSchema,
  seller_id: z.string().min(1, "Seller ID is required"),
  selling_price: z.number().min(0, "Selling price must be a positive number"),
  purchase_price: z.number().min(0, "Purchase price must be a positive number"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  available_quantity: z.number().min(0, "Stock must be a non-negative number"),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const createMedicineSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  selling_price: z.number().min(0, "Selling price must be a positive number"),
  purchase_price: z.number().min(0, "Purchase price must be a positive number"),
  available_quantity: z.number().min(0, "Stock must be a non-negative number"),
});

type MEDICINE = z.infer<typeof medicineSchema>;
type CREATE_MEDICINE = Omit<
  MEDICINE,
  "id" | "createdAt" | "updatedAt" | "seller"
>;

export {
  medicineSchema,
  type CREATE_MEDICINE,
  type MEDICINE,
  createMedicineSchema,
};
