import { z } from "@chatapp/common";

export const createConversationSchema = z.object({
  title:z.string().min(1).max(255).optional(),
  participantIds:z.array(z.string().uuid()).min(1),
})

export const listConversationQuerySchema = z.object({
  participantId:z.string().uuid().optional(),
  limit:z.number().min(1).max(100).optional().default(10),
  offset:z.number().min(0).optional().default(0),
})