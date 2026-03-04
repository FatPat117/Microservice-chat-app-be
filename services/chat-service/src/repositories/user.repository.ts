import { getMongoClient } from "@/clients/mongo.client";
import type { UserCreatedPayload } from "@chatapp/common";
import type { Collection } from "mongodb";

const COLLECTION_NAME = "users";
interface UserDocument {
  _id:string;
  email:string;
  displayName:string;
  createdAt:Date;
  updatedAt:Date;
}

// Function to get the collection
const getCollection = async ():Promise<Collection<UserDocument>> =>{
  const client = await getMongoClient();
  return client.db().collection<UserDocument>(COLLECTION_NAME);
}

export const userRepository = {
  async upsertUser(payload:UserCreatedPayload){
    const collection = await getCollection();
    await collection.updateOne(
      { _id: payload.id },
      { $set: { 
        email: payload.email, 
        displayName: payload.displayName, 
        createdAt: new Date(payload.createdAt), 
        updatedAt: new Date(payload.createdAt) } },
      { upsert: true }
    );  
  },

  async findUserById(id:string):Promise<UserDocument | null>{
    const collection = await getCollection();
    const user = await collection.findOne({ _id: id });
    return user;
  }
}