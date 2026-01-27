import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_PREFIX } from "./constant";
import authRouter from "./modules/auth/auth.route";
import { errorHandler } from "./middlewares/error.middleware";
import {
  authRateLimiter,
  rateLimiter,
} from "./middlewares/rateLimit.middleware";

const app: Application = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
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

app.use(errorHandler);
export default app;
