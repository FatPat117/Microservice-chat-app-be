import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { MongoClient } from "mongodb";

let client: MongoClient | null = null;

export const getMongoClient = async ():Promise<MongoClient> =>{
  if(client){
    return client;
  }
  const mongoClient = new MongoClient(env.MONGO_URL);
  await mongoClient.connect();
  logger.info("Connected to MongoDB");
  client = mongoClient;
  return mongoClient;
}

export const disconnectFromMongo = async ():Promise<void> =>{
  if(client){
    await client.close();
    logger.info("Disconnected from MongoDB");
    client = null;
  }
}