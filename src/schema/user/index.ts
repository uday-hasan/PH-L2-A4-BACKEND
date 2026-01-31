import * as z from "zod";

const addressSchema = z.object({
  userId: z.string(),
  address: z.string(),
});

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
  userType: z.enum(["ADMIN", "CUSTOMER", "SELLER"]),
  address: z.array(addressSchema),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

const registerUserSchema = userSchema.omit({
  address: true,
  createdAt: true,
  updatedAt: true,
  id: true,
});
const loginUserSchema = userSchema.pick({
  email: true,
  password: true,
});

type REGISTER_USER = z.infer<typeof registerUserSchema>;
type LOGIN_USER = z.infer<typeof loginUserSchema>;
type REQUEST_USER = Omit<USER, "password" | "address">;

type USER = z.infer<typeof userSchema>;

export {
  userSchema,
  registerUserSchema,
  loginUserSchema,
  type USER,
  type REGISTER_USER,
  type LOGIN_USER,
  type REQUEST_USER,
};
