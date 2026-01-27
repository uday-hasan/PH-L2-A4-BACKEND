import { REQUEST_USER } from "../schema/user";

declare global {
  namespace Express {
    interface Request {
      user?: REQUEST_USER;
    }
  }
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}
