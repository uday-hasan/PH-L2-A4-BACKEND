import { config } from "../config/env";

// Logger utility
export const logger = {
  info: (message: string) => {
    if (config.nodeEnv === "development") {
      console.log(`[INFO] ${new Date().toISOString()}: ${message}`);
    }
  },
  error: (message: string, error?: any) => {
    if (config.nodeEnv === "development") {
      console.error(
        `[ERROR] ${new Date().toISOString()}: ${message}`,
        error || "",
      );
    }
  },
  warn: (message: string) => {
    if (config.nodeEnv === "development") {
      console.warn(`[WARN] ${new Date().toISOString()}: ${message}`);
    }
  },
  debug: (message: string) => {
    if (config.nodeEnv === "development") {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`);
    }
  },
};
