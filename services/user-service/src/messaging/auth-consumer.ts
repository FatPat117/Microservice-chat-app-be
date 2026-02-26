import { env } from "@/configs/env";
import { userService } from "@/services/user.service";
import { logger } from "@/utils/logger";
import { AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTER_ROUTING_KEY, AuthUserRegisteredPayload, InboundEvent } from "@chatapp/common";
import amqplib, { type Channel, type ChannelModel, type Connection, type ConsumeMessage, type Replies } from "amqplib";
type ManageConnection = Connection & ChannelModel

/*
 * Module-level state: giữ reference tới connection, channel, consumerTag
 * để có thể cleanup (graceful shutdown) khi service dừng.
 */
let connectionRef:ManageConnection | null = null;
let channel:Channel | null = null;
let consumerTag:string | null = null;

const QUEUE_NAME ='auth-service.auth-events'

/**
 * Xử lý từng message nhận được từ queue.
 * 
 * Luồng: raw bytes → JSON parse → gọi userService.syncFromAuthUser → ack
 * Nếu hàm này throw, caller (consumerHandler) sẽ nack message.
 */
const handleMessage = async (message:ConsumeMessage,channel:Channel) =>{
  const raw = message.content.toString('utf-8');
  const event = JSON.parse(raw) as InboundEvent<typeof AUTH_USER_REGISTER_ROUTING_KEY, AuthUserRegisteredPayload>;

  const user = await userService.syncFromAuthUser(event.payload);
  channel.ack(message)
  logger.info({userId: user.id, email: user.email}, "User service: Synced user from auth event")
}

/**
 * Khởi tạo consumer lắng nghe event "user.registered" từ auth-service.
 *
 * Topology RabbitMQ được setup ở đây:
 *   Exchange (topic) ──routing_key──▶ Queue ──▶ consumerHandler
 *   "auth.events"    "auth.user.registered"   "auth-service.auth-events"
 */
export const startAuthEventConsumer = async () =>{
  if(!env.RABBITMQ_URL){
    logger.warn("RabbitMQ URL is not set, skipping event consumer");
    return;
  }

  // Idempotent: nếu channel đã tồn tại thì không tạo lại
  if(channel){
    return;
  }

  const connection = await amqplib.connect(env.RABBITMQ_URL) as unknown as ManageConnection;
  connectionRef = connection ;
  channel = await connection.createChannel();
 
  // Đảm bảo exchange tồn tại (type=topic cho phép route bằng pattern, durable=true để survive restart)
  await channel.assertExchange(AUTH_EVENT_EXCHANGE, "topic", { durable: true });

  // Đảm bảo queue tồn tại (durable=true: message không mất khi RabbitMQ restart)
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });

  // Bind queue vào exchange với routing key cụ thể
  // → chỉ nhận message có routing key = "auth.user.registered"
  await channel.bindQueue(queue.queue, AUTH_EVENT_EXCHANGE, AUTH_USER_REGISTER_ROUTING_KEY);
  
  /**
   * Wrapper callback cho channel.consume.
   * RabbitMQ gọi hàm này mỗi khi có message mới trong queue.
   * 
   * - Thành công → ack (xóa message khỏi queue)
   * - Thất bại  → nack(requeue=false) (chuyển vào dead-letter hoặc discard)
   */
  const consumerHandler = (message:ConsumeMessage | null) =>{
    if(!message){
      return;
    }
    void handleMessage(message,channel!).catch((error)=>{
      logger.error({err: error, routingKey: message.fields.routingKey}, "User service: Error handling message");
      channel?.nack(message,false,false)
    });
  }
  
  // noAck=false: bắt buộc phải ack/nack thủ công (đảm bảo message không mất nếu xử lý lỗi)
  const result: Replies.Consume = await channel.consume(queue.queue, consumerHandler, { noAck: false });
  consumerTag = result.consumerTag;
  
  connection.on("error",(error)=>{
    logger.error("User service: RabbitMQ connection error", error);
    process.exit(1);
  });
  
  connection.on("close",()=>{
    logger.error("User service: RabbitMQ connection closed");
    connectionRef = null;
    channel = null;
    consumerTag = null;
    void closeConnection(connection);
  });
  logger.info("User service: Auth event consumer started");
}

/** Graceful shutdown: hủy consumer rồi đóng connection. */
export const stopAuthEventConsumer = async () =>{
  if(!connectionRef || !channel || !consumerTag){
    return;
  }
  await channel.cancel(consumerTag);
  await closeConnection(connectionRef);
}

const closeConnection = async (connection:ManageConnection) =>{
  await connection.close();
  connectionRef = null;
  channel = null;
  consumerTag = null;
  logger.info("User service: Closed connection to RabbitMQ");
}
