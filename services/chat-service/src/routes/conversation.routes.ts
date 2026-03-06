import { createConversation, getConversationById, listConversation, touchConversation } from "@/controllers/conversation.controller";
import { attachAuthenticatedUser } from "@/middleware/authenticated-user";
import { createConversationSchema } from "@/validation/conversation.schema";
import { conversationIdParamsSchema } from "@/validation/shared.schema";
import { validateRequest, z } from "@chatapp/common";
import { Router } from "express";
const conversationRouter:Router = Router();

conversationRouter.post("/",validateRequest({body:createConversationSchema}), attachAuthenticatedUser, createConversation);
conversationRouter.get("/", attachAuthenticatedUser, listConversation);
conversationRouter.get("/:conversationId",validateRequest({params:conversationIdParamsSchema}), attachAuthenticatedUser, getConversationById);
conversationRouter.post("/:conversationId/touch",validateRequest({params:conversationIdParamsSchema, body:z.object({preview:z.string()})}), attachAuthenticatedUser, touchConversation);

export default conversationRouter;