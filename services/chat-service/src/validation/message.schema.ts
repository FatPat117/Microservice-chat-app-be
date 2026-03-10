import { z } from "@chatapp/common";

export const createMessageBodySchema = z.object({
  body:z.string().min(1).max(2000),

})

export const createMessageSchema = createMessageBodySchema.extend({
  conversationId:z.string().uuid(),
})

export const listMessagesQuerySchema = z.object({
  limit:z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.number().min(1).max(100).optional().default(10)
  ),
  after:z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().datetime().optional()
  )
}).transform((data) => ({
  limit: data.limit,
  after: data.after ? new Date(data.after) : undefined,
}));

export const messageIdParamsSchema = z.object({
  messageId:z.string().uuid(),
}).transform((data) => ({
  messageId: data.messageId,
}));