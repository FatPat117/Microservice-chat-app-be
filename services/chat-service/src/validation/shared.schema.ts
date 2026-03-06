import { z } from "@chatapp/common";

export const conversationIdParamsSchema = z.object({
  conversationId:z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId"),
})

export const conversationIdQuerySchema = z.object({
  conversationId:z
    .string()
    .regex(/^[a-fA-F0-9]{24}$/, "Invalid MongoDB ObjectId")
    .optional(),
})