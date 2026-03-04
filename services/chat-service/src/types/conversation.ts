export interface Conversation {
  id:string;
  title:string|null;
  participantIds:string[];
  createdAt:Date;
  updateAt:Date;
  lastMessageAt:Date|null;
  lastMessagePreview:string|null; 
}


export interface CreateConversationInput{
  title?:string | null,
  participantIds:string[],
}

export interface ConversationFilter{
  participantId:string;
  limit?:number;
  offset?:number;
}

export type ConversationSummary = Conversation