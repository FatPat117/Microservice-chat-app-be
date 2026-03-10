import { z } from "@chatapp/common";

export const createConversationBodySchema = z.object({
  title:z.string().min(1).max(255).optional(),
  participantIds:z.array(z.string().uuid()).min(1),
})

export const conversationIdParamsSchema = z.object({
  conversationId:z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId"),
})

export const listConversationsQuerySchema = z.object({
  participantId:z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().uuid().optional()
  ),
  limit:z.coerce.number().min(1).max(100).optional().default(10),
  offset:z.coerce.number().min(0).optional().default(0),
})

export const createMessageBodySchema = z.object({
  body:z.string().min(1).max(2000),
})

export const listMessagesQuerySchema = z.object({
  limit:z.coerce.number().min(1).max(100).optional().default(10),
  after:z.date().optional(),
}).transform((data) => ({
  limit: data.limit,
  after: data.after ? new Date(data.after) : undefined,
}));  

export const messageIdParamsSchema = z.object({
  messageId:z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId"),
})