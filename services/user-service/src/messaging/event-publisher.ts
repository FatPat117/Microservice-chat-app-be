import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { USER_CREATED_ROUTING_KEY, USER_EVENT_EXCHANGE } from "@chatapp/common";
import { connect } from "amqplib";


type ManagedConnection = any;
let connection : ManagedConnection | null = null;
let channel:any| null = null;

const messagingEnabled = Boolean(env.RABBITMQ_URL)

const ensureChannel = async () : Promise<any | null>  => {
  if(!messagingEnabled){
    logger.warn("User service: Messaging is disabled, skipping event publication");
    return null;
  }

  if(channel){
    return channel;
  }

  if(!env.RABBITMQ_URL){
    logger.warn("User service: RabbitMQ URL is not configured, skipping event publication");
    return null;
  }

  const amqpConnection = await connect(env.RABBITMQ_URL) as unknown as ManagedConnection;
  connection = amqpConnection;

  connection.on('close',() =>{
    logger.warn("RabbitMQ connection close");
    connection = null;
    channel = null;
  })

  connection.on('error',(error) =>{
    logger.error("RabbitMQ connection error", error);
    connection = null;
    channel = null;
  })

  const amqpChannel = await connection.createChannel();
  channel = amqpChannel;
  await amqpChannel.assertExchange(USER_EVENT_EXCHANGE, "topic", { durable: true });

  channel = amqpChannel;

  logger.info("User service: Event publishing initialized");
  return channel;
};

export const initMessaging = async () =>{
  if(!messagingEnabled){
    logger.info('RabbitMQ is not configured; messaging disabled');
    return;
  }

  await ensureChannel();
  logger.info('RabbitMQ messaging initialized');
};

export const closeMessaging = async () =>{
  if(!messagingEnabled){
    logger.info('RabbitMQ is not configured; messaging disabled');
    return;
  }

  try {
    if(channel){
      const currentChannel = channel;
      channel=null;
      await currentChannel.close();
    }

    if(connection){
      const currentConnection: ManagedConnection = connection;
      connection=null;
      await currentConnection.close();
    }
    logger.info('User Service: User service RabbitMQ publisher closed')
  } catch (error) {
    logger.error({err:error}, 'Error closing RabbitMQ messaging');
}
}

export const publishUserCreatedEvent = async (payload:{
  id:string;
  email:string;
  displayName:string;
  createdAt:string;
}) =>{
  const ch = await ensureChannel();

  if(!ch){
    logger.warn('User service: Event publishing not initialized, skipping event publication');
    return;
  }

  const event = {
    type:USER_CREATED_ROUTING_KEY,
    payload:payload,
    occurredAt:new Date().toISOString(),
  }

  try {
    const success = ch.publish(USER_EVENT_EXCHANGE, event.type, Buffer.from(JSON.stringify(event)),{
      persistent:true,
      contentType:'application/json'
    });  

    if(!success){
      logger.warn({event}, 'User service: Failed to publish user created event');
      return;
    }
    logger.info({event}, 'User service: User created event published successfully');
  } catch (error) {
    logger.error({err:error}, 'User service: Error publishing user created event');
  }
}

