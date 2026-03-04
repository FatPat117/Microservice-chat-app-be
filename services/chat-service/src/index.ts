import { env } from "@/configs/env";
import { createServer } from "http";
import { createApp } from "./app";
import { disconnectFromMongo, getMongoClient } from "./clients/mongo.client";
import { connectRedis, disconnectFromRedis } from "./clients/redis.client";
import { startConsumers, stopConsumers } from "./messaging/rabbitmq.consumer";
import { logger } from "./utils/logger";
const main = async () =>{
  try {
    const app = createApp();
    const server = createServer(app);
    await Promise.all([getMongoClient(),connectRedis(),startConsumers()]);

    const port = env.CHAT_SERVICE_PORT;

    server.listen(port,()=>{
      logger.info(`Chat service is running on port ${port}`);
    });

    const shutdown =() =>{
      Promise.all([disconnectFromMongo(),disconnectFromRedis(),stopConsumers()]);
      logger.info("Shutting down chat srvice"); 
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