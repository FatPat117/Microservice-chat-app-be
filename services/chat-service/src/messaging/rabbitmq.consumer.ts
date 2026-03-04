import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { InboundEvent, USER_CREATED_ROUTING_KEY, USER_EVENT_EXCHANGE, UserCreatedEvent, UserCreatedPayload } from "@chatapp/common";
import { ConsumeMessage, Replies, connect, type Channel, type ChannelModel, type Connection } from "amqplib";
import { userRepository } from "../repositories/user.repository";

type ManageConnection = Connection & ChannelModel

/*
 * Module-level state: giữ reference tới connection, channel, consumerTag
 * để có thể cleanup (graceful shutdown) khi service dừng.
 */
let connectionRef:ManageConnection | null = null;
let channel:Channel | null = null;
let consumerTag:string | null = null;

const EVENT_QUEUE_NAME = "chat-service.user-events"
const RABBITMQ_RETRY_DELAY_MS = 3000;

const sleep = (ms:number) => new Promise((resolve) => setTimeout(resolve, ms));

const connectWithRetry = async (url:string): Promise<ManageConnection> => {
  while (true) {
    try {
      return await connect(url) as unknown as ManageConnection;
    } catch (error) {
      logger.error({ err: error }, "Chat service: Failed to connect RabbitMQ, retrying...");
      await sleep(RABBITMQ_RETRY_DELAY_MS);
    }
  }
}

export const closeAmqpConnection = async (connection:ManageConnection) =>{
  await connection.close();
  connectionRef = null;
  channel = null;
  consumerTag = null;
  logger.info("Chat service: Closed connection to RabbitMQ");
}

const handleUserCreated = async (event:UserCreatedEvent) =>{
  await userRepository.upsertUser(event.payload);
}

export const startConsumers = async () =>{
  if(!env.RABBITMQ_URL){
    logger.warn("RabbitMQ URL is not set, skipping event consumer");
    return;
  }

  const connection = await connectWithRetry(env.RABBITMQ_URL);
  connectionRef = connection;
  channel = await connection.createChannel();

  // Assert the exchange exists
  await channel.assertExchange(USER_EVENT_EXCHANGE, "topic", { durable: true });

  // Assert the queue exists
  const queue = await channel.assertQueue(EVENT_QUEUE_NAME, { durable: true });

  // Bind the queue to the exchange
  await channel.bindQueue(queue.queue, USER_EVENT_EXCHANGE, USER_CREATED_ROUTING_KEY);
  

  const consumerHandler = (message:ConsumeMessage | null) =>{
    if(!message){
      return;
    }
    void (async () => {
      const payload = message.content.toString('utf-8');
      const event = JSON.parse(payload) as InboundEvent<typeof USER_CREATED_ROUTING_KEY, UserCreatedPayload>;
      await handleUserCreated(event);
      channel?.ack(message);
    })().catch((error) => {
      logger.error({err: error, routingKey: message.fields.routingKey}, "Chat service: Error handling message");
      channel?.nack(message,false,false);
    });
  } 

  const result:Replies.Consume = await channel.consume(queue.queue, consumerHandler, { noAck: false });
  consumerTag = result.consumerTag;

  logger.info("Chat service: User created consumer started");

  connection.on("error",(error)=>{
    logger.error({ err: error }, "Chat service: RabbitMQ connection error");
  });
  
  connection.on("close",()=>{
    logger.error("Chat service: RabbitMQ connection closed");
    connectionRef = null;
    channel = null;
    consumerTag = null;
    void closeAmqpConnection(connection);
  });
}


export const stopConsumers = async () =>{
  if(!connectionRef || !channel || !consumerTag){
    return;
  }
  await channel.cancel(consumerTag);
  await closeAmqpConnection(connectionRef);
} 