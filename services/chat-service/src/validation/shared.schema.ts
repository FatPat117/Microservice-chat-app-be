import { z } from "@chatapp/common";

export const conversationIdParamsSchema = z.object({
  conversationId:z.string().uuid(),
})

export const conversationIdQuerySchema = z.object({
  conversationId:z.string().uuid().optional(),
})