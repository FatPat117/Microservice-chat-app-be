import { conversationCache } from "@/cache/conversation.cache";
import { conversationRepository } from "@/repositories/conversation.repository";
import type { Conversation, ConversationFilter, ConversationSummary, CreateConversationInput } from "@/types/conversation";
import { HttpError } from "@chatapp/common";


export const ConversationService = {
  async createConversation(input:CreateConversationInput):Promise<Conversation>{
    const conversation = await conversationRepository.create(input);
    await conversationCache.set(conversation)
    return conversation;
  },

  async getConversationById(conversationId:string): Promise<Conversation>{
    const cachedConversation = await conversationCache.get(conversationId);
    if(cachedConversation){
      return cachedConversation;
    }

    const conversation = await conversationRepository.findConversationById(conversationId);

    if(!conversation){
      throw new HttpError(404, "Conversation not found")
    }

    await conversationCache.set(conversation);
    return conversation;
  },

  async listConversation(filter:ConversationFilter): Promise<ConversationSummary[]>{
    const conversations = await conversationRepository.findSummaries(filter);
    return conversations;
  },

  async touchConversation(conversationId:string,preview: string):Promise<void>{
    await conversationRepository.touchConversation(conversationId,preview);
  },

  
}