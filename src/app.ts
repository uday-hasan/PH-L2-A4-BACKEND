import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_PREFIX } from "./constant";
import authRouter from "./modules/auth/auth.route";
import { errorHandler } from "./middlewares/error.middleware";
import { rateLimiter } from "./middlewares/rateLimit.middleware";
import medicineRouter from "./modules/medicine/medicine.route";
import categoryRouter from "./modules/category/category.route";
import userRouter from "./modules/user/user.route";
import orderRouter from "./modules/order/order.route";
import cartRouter from "./modules/cart/cart.route";
import reviewRouter from "./modules/review/review.router";
import { config } from "./config/env";

const app: Application = express();
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

const routeName = (path: string) => `${API_PREFIX}/${path}`;

app.get(routeName("/health"), (_req: Request, res: Response) => {
  res.send("API is up and running!");
});

app.use(routeName("auth"), authRouter);
app.use(routeName("medicine"), medicineRouter);
app.use(routeName("category"), categoryRouter);
app.use(routeName("users"), userRouter);
app.use(routeName("orders"), orderRouter);
app.use(routeName("cart"), cartRouter);
app.use(routeName("review"), reviewRouter);

app.use(errorHandler);
export default app;
