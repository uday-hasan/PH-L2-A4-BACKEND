import { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { config } from "../config/env";
import jwt from "jsonwebtoken";
export function generateAccessToken(payload: JwtPayload): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.expiresIn!, // string or number
  };
  return jwt.sign(payload, config.jwt.secret, signOptions);
}

export function generateRefreshToken(payload: JwtPayload): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn!, // string or number
  };
  return jwt.sign(payload, config.jwt.refreshSecret as Secret, signOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as JwtPayload;
}
