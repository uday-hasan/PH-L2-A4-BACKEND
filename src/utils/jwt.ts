import { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import jwt from "jsonwebtoken";
interface AccessTokenPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "USER" | "SELLER";
  iat?: number;
  exp?: number;
}
export function generateAccessToken(payload: JwtPayload): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn!,
  };
  return jwt.sign(payload, config.jwt.secret, signOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn!,
  };
  return jwt.sign(payload, config.jwt.refreshSecret as Secret, signOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, config.jwt.secret) as AccessTokenPayload;

  return decoded;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
