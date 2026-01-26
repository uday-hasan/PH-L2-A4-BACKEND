import * as z from "zod";

const addressSchema = z.object({
  userId: z.string(),
  address: z.string(),
});

const userSchema = z.object({
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
  userType: z.enum(["ADMIN", "CUSTOMER", "SELLER"]),
  address: z.array(addressSchema),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

const registerUserSchema = userSchema.omit({
  address: true,
  createdAt: true,
  updatedAt: true,
});

type REGISTER_USER = z.infer<typeof registerUserSchema>;

type USER = z.infer<typeof userSchema>;
type LOGIN_USER = Omit<USER, "createdAt" | "updatedAt" | "address" | "name">;
export {
  userSchema,
  registerUserSchema,
  type USER,
  type REGISTER_USER,
  type LOGIN_USER,
};
