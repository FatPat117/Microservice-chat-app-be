import { asyncHandler, z } from "@chatapp/common";
import { conversationIdParamsSchema, createConversationBodySchema, listConversationsQuerySchema } from "@/validation/conversation.schema";
import { validateRequest } from "@chatapp/common";
import { Router } from "express";
import { createConversation, listConversations, getConversationById, touchConversation } from "@/controllers/conversation.controller";
import { requireAuthMiddleware } from "@/middleware/require-auth";

export const conversationRouter:Router = Router();
conversationRouter.use(requireAuthMiddleware);

conversationRouter.post("/",validateRequest({body:createConversationBodySchema}),asyncHandler(createConversation));
conversationRouter.get("/",validateRequest({query:listConversationsQuerySchema}),asyncHandler(listConversations));
conversationRouter.get("/:conversationId",validateRequest({params:conversationIdParamsSchema}),getConversationById);
conversationRouter.post("/:conversationId/touch",validateRequest({params:conversationIdParamsSchema, body:z.object({preview:z.string()})}),touchConversation);  