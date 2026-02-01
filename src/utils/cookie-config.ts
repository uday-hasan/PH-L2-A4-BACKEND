import type { CookieOptions } from "express";
import { config } from "../config/env";

export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: config.nodeEnv === "production" ? "none" : "lax",
  path: "/",
});
