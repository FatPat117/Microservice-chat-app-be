import { env } from "@/configs/env";
import { createServer } from "http";
import { createApp } from "./app";
import { initModels } from "./db";
import { connectToDatabase } from "./db/sequelize";
import { startAuthEventConsumer } from "./messaging/auth-consumer";
import { logger } from "./utils/logger";
const main = async () =>{
  try {
    const app = createApp();
    const server = createServer(app);
    await connectToDatabase();
    await initModels();
    await startAuthEventConsumer();

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