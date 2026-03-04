import { env } from "@/configs/env";
import { createServer } from "http";
import { createApp } from "./app";
import { logger } from "./utils/logger";
const main = async () =>{
  try {
    const app = createApp();
    const server = createServer(app);

    const port = env.CHAT_SERVICE_PORT;

    server.listen(port,()=>{
      logger.info(`Chat service is running on port ${port}`);
    });

    const shutdown =() =>{
      logger.info("Shutting down chat service");
      server.close(()=>{
        logger.info("Chat service shutdown complete");
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