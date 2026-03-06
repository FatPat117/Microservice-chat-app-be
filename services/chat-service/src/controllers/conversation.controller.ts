import { ConversationService } from "@/services/conversation.service";
import { getAuthenticatedUser } from "@/utils/auth";
import { createConversationSchema, listConversationQuerySchema } from "@/validation/conversation.schema";
import { conversationIdParamsSchema } from "@/validation/shared.schema";
import { AsyncHandler, HttpError } from "@chatapp/common";


const parsedConversation = (params:unknown) => {
  const {conversationId} = conversationIdParamsSchema.parse(params);
  return conversationId
};

export const createConversation : AsyncHandler = async (req, res, next) => {
  const user = getAuthenticatedUser(req)
  const payload = createConversationSchema.parse(req.body);
  const  uniqueParticipantIds = [...new Set([user.id, ...payload.participantIds])];

  if(uniqueParticipantIds.length < 2){
    throw new HttpError(400, "At least 2 participants are required to create a conversation");
  } 

  const conversation = await ConversationService.createConversation({
    title: payload.title,
    participantIds: uniqueParticipantIds,
  });
  res.status(201).json({data:conversation});
};

export const listConversation : AsyncHandler = async (req, res, next) => {
  const user = getAuthenticatedUser(req);
  const query = listConversationQuerySchema.parse(req.query);
  
  if(query.participantId && query.participantId !== user.id){
    throw new HttpError(403, "You are not authorized to list conversations for this participant");
  }

  const conversations = await ConversationService.listConversation({
    participantId: query.participantId ?? user.id,
    limit: query.limit,
    offset: query.offset,
  });

  res.status(200).json({data:conversations});
};

export const getConversationById : AsyncHandler = async (req, res, next) => {
  const user = getAuthenticatedUser(req);
  const conversationId = parsedConversation(req.params);
  const conversation = await ConversationService.getConversationById(conversationId);

  if(conversation.participantIds.includes(user.id)){
    throw new HttpError(403, "You are not authorized to get this conversation");
  }
  
  res.status(200).json({data:conversation});
};

export const touchConversation : AsyncHandler = async (req, res, next) => {
  const user = getAuthenticatedUser(req);
  const conversationId = parsedConversation(req.params);
  const preview = req.body.preview;
  await ConversationService.touchConversation(conversationId,preview);
  res.status(200).json({message:"Conversation touched successfully"});
}