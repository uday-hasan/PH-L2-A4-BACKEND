import app from "./app";
import { config } from "./config/env";
import { logger } from "./utils/logger";

app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});
