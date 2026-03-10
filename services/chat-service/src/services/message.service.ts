import { conversationRepository } from "@/repositories/conversation.repository";
import { messageRepository } from "@/repositories/message.repository";
import type {
  CreateMessageInput,
  Message,
  MessageListOptions
} from "@/types/message";
import { HttpError } from "@chatapp/common";

export const messageService={
  async createMessage(input:CreateMessageInput):Promise<Message>{
    // Ensure conversation before creating the message 
    const existConversation = await conversationRepository.findConversationById(input.conversationId);
    if(!existConversation){
      throw new HttpError(404, "Conversation not found");
    }

    if(!existConversation.participantIds.includes(input.senderId)){
      throw new HttpError(403, "You are not authorized to send messages to this conversation");
    }

    const message = messageRepository.create(input.conversationId, input.senderId, input.body);

    await conversationRepository.touchConversation(input.conversationId, input.body);
    return message;
  },
  async findMessageByConversationId(conversationId:string,userRequestId:string, options:MessageListOptions):Promise<Message[]>{
    // Ensure conversation exists
    const existConversation = await conversationRepository.findConversationById(conversationId);
    if(!existConversation){
      throw new HttpError(404, "Conversation not found");
    }

    if(!existConversation.participantIds.includes(userRequestId)){
      throw new HttpError(403, "You are not authorized to access this conversation");
    }

    const messages = await messageRepository.findByConversation(conversationId, options);
    return messages;
  }
  ,async findMessageById(messageId:string,userRequestId:string):Promise<Message>{
    const message = await messageRepository.findById(messageId);
    if(!message){
      throw new HttpError(404, "Message not found");
    }

    if(message.senderId !== userRequestId){
      throw new HttpError(403, "You are not authorized to access this message");
    }
    return message;
  } 
}