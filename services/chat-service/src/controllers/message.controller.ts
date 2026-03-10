import { messageService } from "@/services/message.service";
import { getAuthenticatedUser } from "@/utils/auth";
import { createMessageBodySchema, listMessagesQuerySchema, messageIdParamsSchema } from "@/validation/message.schema";
import { conversationIdParamsSchema } from "@/validation/shared.schema";
import { AsyncHandler } from "@chatapp/common";
export const createMessage : AsyncHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const { conversationId } = conversationIdParamsSchema.parse(req.params);
    const payload = createMessageBodySchema.parse(req.body);
    const message = await messageService.createMessage({
      senderId:user.id,
      body:payload.body,
      conversationId,
    });
    res.status(201).json({data:message});
  } catch (error) {
    return next(error);
  }
}

export const listMessages : AsyncHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const {conversationId} = conversationIdParamsSchema.parse(req.params);
    const payload = listMessagesQuerySchema.parse(req.query);
    const messages = await messageService.findMessageByConversationId(conversationId, user.id, payload);
    res.status(200).json({data:messages});
  } catch (error) {
    return next(error);
  }
}

export const getMessageById : AsyncHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const {messageId} = messageIdParamsSchema.parse(req.params);
    const message = await messageService.findMessageById(messageId, user.id);
    res.status(200).json({data:message});
  } catch (error) {
    return next(error);
  }
}