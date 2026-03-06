import { getMongoClient } from "@/clients/mongo.client";
import type {
  Conversation,
  ConversationFilter,
  ConversationSummary,
  CreateConversationInput,
} from "@/types/conversation";
import { ObjectId, type Collection, type WithId } from "mongodb";

const CONVERSATIONS_COLLECTION = "conversations";
const MESSAGES_COLLECTION = "messages";

interface ConversationDocument {
  _id:ObjectId;
  title:string | null;
  participantIds:string[];
  createdAt:Date;
  updateAt:Date;
  lastMessageAt:Date | null;
  lastMessagePreview:string | null;
}

const toConversation = (doc:WithId<ConversationDocument>):Conversation =>{
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

const getCollection = async ():Promise<Collection<ConversationDocument>> =>{
  const client = await getMongoClient();
  return client.db().collection<ConversationDocument>(CONVERSATIONS_COLLECTION);
} 

export const conversationRepository = {
  async create(input : CreateConversationInput):Promise<Conversation>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection<ConversationDocument>(CONVERSATIONS_COLLECTION);
    const now = new Date();

    const document: ConversationDocument = {
      _id: new ObjectId(), // let Mongo generate a valid ObjectId
      title: input.title ?? null,
      participantIds: input.participantIds,
      createdAt: now,
      updateAt: now,
      lastMessageAt: null,
      lastMessagePreview: null,
    };

    await collection.insertOne(document);
    return toConversation(document as WithId<ConversationDocument>);
  },
  async findConversationById(conversationId:string):Promise<Conversation | null>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    const result = await collection.findOne({ _id: new ObjectId(conversationId) });
    return result ? toConversation(result as unknown as WithId<ConversationDocument>) : null;
  },
  async findSummaries(filter:ConversationFilter):Promise<ConversationSummary[]>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    const result = await collection
      .find({ participantIds: filter.participantId })
      .sort({ lastMessageAt: -1, updateAt: -1 })
      .skip(filter.offset ?? 0)
      .limit(filter.limit ?? 10)
      .toArray();
    return result.map((doc) => toConversation(doc as unknown as WithId<ConversationDocument>));
  },
  async touchConversation(conversationId:string,preview:string):Promise<void>{
    const client = await getMongoClient();
    const db = client.db();
    const collection = db.collection(CONVERSATIONS_COLLECTION);
    await collection.updateOne({ _id: new ObjectId(conversationId) }, { $set: { lastMessageAt: new Date(), lastMessagePreview: preview } });
  },
}