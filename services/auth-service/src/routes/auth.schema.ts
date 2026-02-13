import { z } from "@chatapp/common"

export const registerSchema = z.object({
  body: z.object({
    email:z.string().email(),
    password:z.string().min(8),
    displayName:z.string().min(3).max(32),
  })  
})

export const loginSchema = z.object({
  body: z.object({
    email:z.string().email(),
    password:z.string().min(8),
  })
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken:z.string().min(1),
  })
})

export const revokeSchema = z.object({
  body: z.object({
   userId:z.string().uuid()
  })
})