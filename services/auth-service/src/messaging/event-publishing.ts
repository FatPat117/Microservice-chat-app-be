import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTER_ROUTING_KEY, AuthUserRegisteredPayload, OutboundEvent } from "@chatapp/common";
import { connect, type Channel, type ChannelModel } from "amqplib";

let connectionRef:ChannelModel |null = null;
let channel:Channel |null = null;
const RABBITMQ_RETRY_DELAY_MS = 3000;

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (url:string): Promise<ChannelModel> => {
  while (true) {
    try {
      return await connect(url);
    } catch (error) {
      logger.error({ err: error }, "Auth service: Failed to connect RabbitMQ, retrying...");
      await sleep(RABBITMQ_RETRY_DELAY_MS);
    }
  }
}

export const initPublisher = async () =>{
  if(!env.RABBITMQ_URL){
    logger.warn("RabbitMQ URL is not set, skipping event publishing");
    return;
  }

  if(channel){
    return;
  }

  const connection = await connectWithRetry(env.RABBITMQ_URL);
  connectionRef = connection;
  channel = await connection.createChannel();

  // Assert the exchange exists
  await channel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

  logger.info("Auth service: Event publishing initialized");

  connection.on("error",(error)=>{
    logger.error({ err: error }, "Auth service: RabbitMQ connection error");
  });

  connection.on("close",()=>{
    logger.error("Auth service: RabbitMQ connection closed");
    channel = null;
    connectionRef = null;
  });
}


export const publishUserRegisteredEvent = async (payload:AuthUserRegisteredPayload) =>{
  if(!channel || !connectionRef){
    logger.warn("Auth service: Event publishing not initialized, skipping event publication");
    return;
  }

  const events ={
    type:AUTH_USER_REGISTER_ROUTING_KEY,
    payload,
    occurredAt:new Date().toISOString(),
    metadata:{
      version: 1
    }
  } as OutboundEvent<typeof AUTH_USER_REGISTER_ROUTING_KEY, AuthUserRegisteredPayload>;

  const published = await channel.publish(AUTH_EVENT_EXCHANGE,AUTH_USER_REGISTER_ROUTING_KEY,Buffer.from(JSON.stringify(events)),{contentType:"application/json",persistent:true});

  if(!published){
    logger.error("Auth service: Failed to publish user registered event");
    return;
  }

  logger.info("Auth service: User registered event published");
}

export const closePublisher = async () =>{
 try {
  const ch = channel
  if(ch){
    await ch.close();
    channel = null;
  }
  const conn = connectionRef;
  if(conn){
    await conn.close();
    connectionRef = null;
  }
  logger.info("Auth service: Event publishing closed");
 } catch (error) {
  logger.error("Auth service: Failed to close event publishing");
  throw error;
 }
}