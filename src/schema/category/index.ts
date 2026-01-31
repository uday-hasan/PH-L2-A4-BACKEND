import * as z from "zod";
import { userSchema } from "../user/index";
const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  createdAt: z.date(),
  updatedAt: z.date(),
});
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

type CATEGORY = z.infer<typeof categorySchema>;
type CREATE_CATEGORY = Omit<CATEGORY, "id" | "createdAt" | "updatedAt">;

export {
  categorySchema,
  type CREATE_CATEGORY,
  type CATEGORY,
  createCategorySchema,
};
