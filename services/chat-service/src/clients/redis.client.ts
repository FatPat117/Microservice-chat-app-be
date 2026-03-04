import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { Redis } from "ioredis";

let redisClient: Redis | null = null;

export const getRedisClient = async ():Promise<Redis> =>{
  if(redisClient){
    return redisClient;
  }

  // lazyConnect: true để kết nối Redis khi cần thiết
  redisClient = new Redis(env.REDIS_URL,{lazyConnect:true});

  redisClient.on("error",(error)=>{
    logger.error({err:error},"Redis connection error");
    process.exit(1);
  });

  redisClient.on("connect",()=>{
    logger.info("Redis connection established");
  });

  redisClient.on("close",()=>{
    logger.info("Redis connection lost");
    process.exit(1);
  });

  redisClient.on("reconnecting",()=>{
    logger.info("Redis connection lost, reconnecting...");
  });

  redisClient.on("ready",()=>{
    logger.info("Redis connection established");
  });


  return redisClient;
}

export const connectRedis = async () =>{
 const client = await getRedisClient();
 if(!client){
  throw new Error("Redis client not initialized");
  return;
 }

 if(client.status === "connecting" || client.status === "ready"){
  return;
 }
 await client.connect();
 logger.info("Redis connection established");
}

export const disconnectFromRedis = async ():Promise<void> =>{
  if(redisClient){
    await redisClient.quit();   
    logger.info("Disconnected from Redis");
    redisClient = null;
  }
}