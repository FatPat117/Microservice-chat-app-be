import type { Conversation } from "@/types/conversation";
import { getRedisClient } from "../clients/redis.client";


const CACHE_PREFIX  = 'conversation';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours

const serialize = (conversation:Conversation):string =>{
  return JSON.stringify({...conversation,createdAt:conversation.createdAt.toISOString(),updateAt:conversation.updateAt.toISOString(),lastMessageAt:conversation.lastMessageAt?.toISOString()});
}

const deserialize = (serialized:string):Conversation =>{
  const parsed =  JSON.parse(serialized) as Conversation & {
    createdAt:string;
    updateAt:string;
  };

  return {
    ...parsed,
    createdAt:new Date(parsed.createdAt),
    updateAt:new Date(parsed.updateAt),
  }
}

export const conversationCache = {
  async get(conversationId:string):Promise<Conversation | null>{
    const client = await getRedisClient();
    const key = `${CACHE_PREFIX}:${conversationId}`;
    const serialized = await client.get(key);
    return serialized ? deserialize(serialized) : null;
  },

  async set(conversation:Conversation):Promise<void>{
    const client = await getRedisClient();
    const key = `${CACHE_PREFIX}:${conversation.id}`;
    const serialized = serialize(conversation);
    await client.set(key,serialized, "EX",CACHE_TTL_SECONDS);
  },

}