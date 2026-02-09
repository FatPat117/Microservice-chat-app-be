import { env } from "@/config/env";
import { createServer } from "http";
import { createApp } from "./app";
import { logger } from "./utils/logger";
const main = async () =>{
  try {
    const app = createApp();
    const server = createServer(app);

    const port = env.AUTH_SERVICE_PORT;

    server.listen(port,()=>{
      logger.info(`Auth service is running on port ${port}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

main();