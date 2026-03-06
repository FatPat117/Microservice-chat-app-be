import { chatProxyService } from "@/services/chat-proxy.service";
import { getAuthenticatedUser } from "@/utils/auth";
import { conversationIdParamsSchema, createConversationBodySchema, listConversationsQuerySchema } from "@/validation/conversation.schema";
import { AsyncHandler, HttpError } from "@chatapp/common";

export const createConversation:AsyncHandler = async (req, res, next) => {
  try {
    const payload = createConversationBodySchema.parse(req.body);
    const userId = getAuthenticatedUser(req).id;

    const uniqueParticipantIds = [...new Set([userId, ...payload.participantIds])];

    if(uniqueParticipantIds.length < 2){
      throw new HttpError(400, 'At least 2 participants are required to create a conversation');
    }

    const conversation = await chatProxyService.createConversation(userId, payload);
    res.status(201).json({data:conversation});
  } catch (error) {
    return next(error);
  }
}

export const listConversations:AsyncHandler = async (req, res, next) => {
  try {
    const userId = getAuthenticatedUser(req).id;
    const { participantId, limit, offset } = listConversationsQuerySchema.parse(req.query as unknown);

    if(participantId && participantId !== userId){
      throw new HttpError(403, 'You are not authorized to list conversations for this participant');
    }

    const conversations = await chatProxyService.listConversations(userId, {
      participantId,
      limit,
      offset,
    });
    res.status(200).json(conversations);
  } catch (error) {
    return next(error);
  }
}

export const getConversationById:AsyncHandler = async (req, res, next) => {
  try {
    const {conversationId} = conversationIdParamsSchema.parse(req.params);
    const userId = getAuthenticatedUser(req).id;
    const conversation = await chatProxyService.getConversationById(conversationId, userId);
    if(!conversation.participantIds.includes(userId)){
      throw new HttpError(403, 'You are not authorized to get this conversation');
    }
    res.status(200).json({data:conversation});
  } catch (error) {
    return next(error);
  }
}

export const touchConversation:AsyncHandler = async (req, res, next) => {
  try {
    const {conversationId} = conversationIdParamsSchema.parse(req.params);
    const userId = getAuthenticatedUser(req).id;
    const preview = req.body.preview;
    if(!preview || typeof preview !== 'string' || preview.length === 0){
      throw new HttpError(400, 'Preview is required');
    }
    await chatProxyService.touchConversation(conversationId, userId, preview);
    res.status(200).json({message: 'Conversation touched successfully'});
  } catch (error) {
    return next(error);
  }
}