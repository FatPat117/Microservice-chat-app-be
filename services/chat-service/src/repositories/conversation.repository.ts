import { getMongoClient } from "@/clients/mongo.client";
import type { Conversation, ConversationFilter, ConversationSummary, CreateConversationInput } from "@/types/conversation";
import { randomUUID } from "crypto";
import { ObjectId, type Collection, type Document, type WithId } from "mongodb";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";

const toConversation = (doc:WithId<Document>):Conversation =>{
  return {
    id:doc._id.toString(),
    title:typeof doc.title === "string" ? doc.title : null,
    participantIds:Array.isArray(doc.participantIds) ? doc.participantIds : [],
    createdAt:new Date(doc.createdAt as string | number | Date),
    updateAt:new Date(doc.updateAt as string | number | Date),
    lastMessageAt:doc.lastMessageAt ? new Date(doc.lastMessageAt as string | number | Date) : null,
    lastMessagePreview:typeof doc.lastMessagePreview === "string" ? doc.lastMessagePreview : null,
  }
} 

const getCollection = async ():Promise<Collection<Document>> =>{
  const client = await getMongoClient();
  return client.db().collection<Document>(CONVERSATIONS_COLLECTION);
} 

export const conversationRepository = {
  async create(input : CreateConversationInput):Promise<Conversation>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    const now = new Date();
    const conversationId = randomUUID();
    const document = {
      _id: new ObjectId(conversationId) ,
      title:input.title ?? null,
      participantIds:input.participantIds,
      createdAt:now,
      updateAt:now,
      lastMessageAt:null,
      lastMessagePreview:null,
    }
    await collection.insertOne(document as unknown as Document);
    return toConversation(document as unknown as WithId<Document>);
  },
  async findConversationById(conversationId:string):Promise<Conversation | null>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    const result = await collection.findOne({ _id: new ObjectId(conversationId) });
    return result ? toConversation(result as unknown as WithId<Document>) : null;
  },
  async findSummaries(filter:ConversationFilter):Promise<ConversationSummary[]>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    const result = await collection.find({ participantId: filter.participantId }).sort({ lastMessageAt: -1, updateAt: -1 }).toArray();
    return result.map(toConversation);
  },
}