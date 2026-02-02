import app from "./app";
import { config } from "./config/env";
import { logger } from "./utils/logger";

if (config.nodeEnv !== "production") {
  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });
}
