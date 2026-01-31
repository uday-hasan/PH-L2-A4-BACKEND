import { z } from "zod";

export const createOrderSchema = z.object({
  shippingAddress: z.string().min(5, "Address is too short"),
  items: z
    .array(
      z.object({
        medicineId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .nonempty("Cart cannot be empty"),
});

export type CREATE_ORDER = z.infer<typeof createOrderSchema>;
