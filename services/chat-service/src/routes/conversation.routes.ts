import { createConversation, getConversationById, listConversation, touchConversation } from "@/controllers/conversation.controller";
import { createMessage, getMessageById, listMessages } from "@/controllers/message.controller";
import { attachAuthenticatedUser } from "@/middleware/authenticated-user";
import { createConversationSchema } from "@/validation/conversation.schema";
import { createMessageBodySchema, listMessagesQuerySchema, messageIdParamsSchema } from "@/validation/message.schema";
import { conversationIdParamsSchema } from "@/validation/shared.schema";
import { validateRequest, z } from "@chatapp/common";
import { Router } from "express";
const conversationRouter:Router = Router();

conversationRouter.post("/",validateRequest({body:createConversationSchema}), attachAuthenticatedUser, createConversation);
conversationRouter.get("/", attachAuthenticatedUser, listConversation);
conversationRouter.get("/:conversationId",validateRequest({params:conversationIdParamsSchema}), attachAuthenticatedUser, getConversationById);
conversationRouter.post("/:conversationId/touch",validateRequest({params:conversationIdParamsSchema, body:z.object({preview:z.string()})}), attachAuthenticatedUser, touchConversation);


// Message
conversationRouter.post("/:conversationId/messages",validateRequest({params:conversationIdParamsSchema, body:createMessageBodySchema}), attachAuthenticatedUser, createMessage);
conversationRouter.get("/:conversationId/messages",validateRequest({params:conversationIdParamsSchema, query:listMessagesQuerySchema}), attachAuthenticatedUser, listMessages);
conversationRouter.get("/:conversationId/messages/:messageId",validateRequest({params:messageIdParamsSchema}), attachAuthenticatedUser, getMessageById);
export default conversationRouter;