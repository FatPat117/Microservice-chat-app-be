const MESSAGES_COLLECTION = "messages";
import { getMongoClient } from "@/clients/mongo.client";
import type { Message, MessageListOptions, Reaction } from "@/types/message";
import { Document, Filter, ObjectId, WithId } from "mongodb";

interface MessageDocument {
  _id:ObjectId;
  conversationId:string;
  senderId:string;
  body:string;
  createdAt:Date;
  reactions:Reaction[] | null;
} 

const toMessage = (doc:WithId<MessageDocument>):Message =>{
  return {
    id:doc._id.toString(),
    conversationId:doc.conversationId,
    senderId:doc.senderId,
    body:doc.body,
    createdAt:doc.createdAt,
    reactions:Array.isArray(doc.reactions)
      ? doc.reactions.map((reaction:Reaction) => ({
        emoji:reaction.emoji,
        userId:reaction.userId,
        createdAt:reaction.createdAt,
      }))
      : [],
  };
}

export const messageRepository = {
  async create(conversationId:string, senderId:string, body:string):Promise<Message>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection<MessageDocument>(MESSAGES_COLLECTION);
    const now = new Date();
    const message: MessageDocument = {
      _id: new ObjectId(),
      conversationId,
      senderId,
      body,
      createdAt: now,
      reactions: [],
    };
    await collection.insertOne(message);
    return toMessage(message as WithId<MessageDocument>);
  },
  
  async findByConversation(conversationId:string,
    options:MessageListOptions = {}
  ):Promise<Message[]>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection<MessageDocument>(MESSAGES_COLLECTION);
    const query:Filter<MessageDocument> = { conversationId };
    if(options.after){
      query.createdAt = { $gt: options.after };
    }
    const messages = await collection.find(query).sort({ createdAt: -1 }).limit(options.limit ?? 10).toArray();
    return messages.map(toMessage);
  }
  ,
  async findById(messageId:string):Promise<Message | null>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection<Document>(MESSAGES_COLLECTION);
    const message = await collection.findOne({ _id: new ObjectId(messageId) });
    return message ? toMessage(message as WithId<MessageDocument>) : null;
  }
}