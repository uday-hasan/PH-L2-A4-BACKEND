import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { API_PREFIX } from "./constant";
import authRouter from "./modules/auth/auth.route";

const app: Application = express();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

const routeName = (path: string) => `${API_PREFIX}/${path}`;

app.get(routeName("/health"), (_req: Request, res: Response) => {
  res.send("API is up and running!");
});

app.use(routeName("auth"), authRouter);
export default app;
