import { z } from "zod";

export const addToCartSchema = z.object({
  medicineId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

export type ADD_TO_CART = z.infer<typeof addToCartSchema>;
