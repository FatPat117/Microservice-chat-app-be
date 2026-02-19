import { env } from "@/configs/env";
import { createInternalAuthMiddleware } from "@chatapp/common";
import { createServer } from "http";
import { createApp } from "./app";
import { logger } from "./utils/logger";
const main = async () =>{
  try {
    const app = createApp();
    const server = createServer(app);
   
    const port = env.USER_SERVICE_PORT;

    server.listen(port,()=>{
      logger.info(`User service is running on port ${port}`);
    });

    const shutdown =() =>{
      logger.info("Shutting down user service");
      server.close(()=>{
        logger.info("User service shutdown complete");
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