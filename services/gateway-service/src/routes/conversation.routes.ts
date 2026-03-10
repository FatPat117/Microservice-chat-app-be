import { createConversation, createMessage, getConversationById, getMessageById, listConversations, listMessages, touchConversation } from "@/controllers/conversation.controller";
import { requireAuthMiddleware } from "@/middleware/require-auth";
import { conversationIdParamsSchema, createConversationBodySchema, createMessageBodySchema, listConversationsQuerySchema, listMessagesQuerySchema, messageIdParamsSchema } from "@/validation/conversation.schema";
import { asyncHandler, validateRequest, z } from "@chatapp/common";
import { Router } from "express";

export const conversationRouter:Router = Router();
conversationRouter.use(requireAuthMiddleware);

conversationRouter.post("/",validateRequest({body:createConversationBodySchema}),asyncHandler(createConversation));
conversationRouter.get("/",validateRequest({query:listConversationsQuerySchema}),asyncHandler(listConversations));
conversationRouter.get("/:conversationId",validateRequest({params:conversationIdParamsSchema}),getConversationById);
conversationRouter.post("/:conversationId/touch",validateRequest({params:conversationIdParamsSchema, body:z.object({preview:z.string()})}),touchConversation);  

conversationRouter.post("/:conversationId/messages",validateRequest({params:conversationIdParamsSchema, body:createMessageBodySchema}),asyncHandler(createMessage));
conversationRouter.get("/:conversationId/messages",validateRequest({params:conversationIdParamsSchema, query:listMessagesQuerySchema}),asyncHandler(listMessages));
conversationRouter.get("/:conversationId/messages/:messageId",validateRequest({params:messageIdParamsSchema}),asyncHandler(getMessageById));