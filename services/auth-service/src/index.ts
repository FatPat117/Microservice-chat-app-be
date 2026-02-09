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

    const shutdown =() =>{
      logger.info("Shutting down auth service");
      server.close(()=>{
        logger.info("Auth service shutdown complete");
        process.exit(0);
      });
    }

    process.on("SIGTERM",shutdown);
    process.on("SIGINT",shutdown);

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

main();