import { Response } from "express";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

import { config } from "../config/env";
const {
  jwt: { secret, expiresIn },
} = config;
export const generateToken = async (
  res: Response,
  { id, email }: { id: string; email: string },
) => {
  const payload = { id, email };
  const signOptions: SignOptions = {
    expiresIn: expiresIn!,
  };

  const token = jwt.sign(payload, secret!, signOptions);
  res.cookie("access-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  });
  return token;
};
