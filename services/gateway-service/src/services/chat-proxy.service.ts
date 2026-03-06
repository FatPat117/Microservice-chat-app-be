import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { env } from "@/configs/env";
import { HttpError, USER_ID_HEADER } from "@chatapp/common";

const createClient = ():AxiosInstance =>{
  const config: AxiosRequestConfig = {
    baseURL: env.CHAT_SERVICE_URL,
    timeout:5000,
    headers:{
      'X-Internal-Token': env.INTERNAL_API_TOKEN
    }
  } as const;
  return axios.create(config);
}

const client = createClient();


const resolvedMessage = (status:number,data:unknown):string =>{
  if(typeof data === 'object' && data !== null && "message" in data ){
    const message = (data as Record<string,unknown>).message 
    if(typeof message === 'string' &&message.trim().length>0){
      return message
    }
  }
  return status >= 500 ? "Chat service is not available" : "An error occurred while processing your request";
}


const handleAxiosError = (error:unknown):never =>{
  if(!axios.isAxiosError(error) || !error.response){
    throw new HttpError(500,"Chat service is not available");
  }
const {status,data} = error.response as {status:number, data:unknown}

throw new HttpError(status,resolvedMessage(status,data),data as Record<string,unknown>);
}

export interface ConversationDto{
  id:string
  title?:string | null;
  participantIds:string[];
  createdAt:string;
  updateAt:string;
  lastMessageAt:string | null;
  lastMessagePreview:string | null;
}

export interface ReactionDto{
  emoji:string;
  userId:string;
  createdAt:string;
}

export interface MessageDto{
  id:string;
  conversationId:string
  senderId:string;
  body:string;
  createdAt:string;
  reactions:ReactionDto[];
}

export interface ConversationResponse{
  data:ConversationDto;
}

export interface ConversationsResponse{
  data:ConversationDto[];
}

export interface MessagesResponse{
  data:MessageDto;
}

export interface MessagesListResponse{
  data: MessageDto[];
}

export interface CreateConversationPayload{
  participantIds:string[];
  title?:string | null;
}

export interface CreateMessagePayload{
  body:string
}

export const chatProxyService = {
  async createConversation(userId:string,
    payload: CreateConversationPayload
  ): Promise<ConversationDto>{
    try {
      const response = await client.post<ConversationResponse>(`/conversations`, payload, {
        headers:{
          [USER_ID_HEADER]: userId
        },
      } );
      return response.data.data
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async listConversations(userId:string,
  ): Promise<ConversationDto[]>{
      try {
        const response = await client.get<ConversationsResponse>(`/conversations`, {
          headers:{
            [USER_ID_HEADER]: userId
          },
        } );
        return response.data.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async getConversationById(conversationId:string,userId:string): Promise<ConversationDto>{
      try {
        const response = await client.get<ConversationResponse>(`/conversations/${conversationId}`, {
          headers:{
            [USER_ID_HEADER]: userId
          },
        } );
        return response.data.data;
      } catch (error) {
        return handleAxiosError(error);
      }
    },

    async touchConversation(conversationId:string, userId:string, preview:string): Promise<void>{
      try {
        await client.post<void>(`/conversations/${conversationId}/touch`, {
          headers:{
            [USER_ID_HEADER]: userId
          },
        } );
      } catch (error) {
        return handleAxiosError(error);
      }
    },
}