import { z } from "zod";
import dotenv from "dotenv";
import { Secret, SignOptions } from "jsonwebtoken";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("5000"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  COOKIE_SECRET: z.string().min(32),
  RATE_LIMIT_WINDOW_MS: z.string().default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().default("100"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

const env = envSchema.parse(process.env);
export const config = {
  nodeEnv: env.NODE_ENV,
  port: parseInt(env.PORT, 10),
  database: {
    url: env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET as Secret,
    refreshSecret: process.env.JWT_REFRESH_SECRET as Secret,
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    refreshExpiresIn: process.env
      .JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  },
  cookie: {
    secret: env.COOKIE_SECRET,
  },
  rateLimit: {
    windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
    maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  },
  cors: {
    origin: env.CORS_ORIGIN,
  },
};
