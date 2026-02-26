import { z } from "@chatapp/common";

export const createUserSchema = z.object({
  email:z.string().email(),
  displayName:z.string().min(3).max(255),
})

export const userIdParamsSchema = z.object({
  id:z.string().uuid(),
});

// Union of array of UUIDs or a single UUID
export const excludeIdsSchema = z.union([z.array(z.string().uuid()), z.string().uuid().transform((val)=>[val]).optional().transform((val)=>val ?? [])]);

export const searchUsersQuerySchema = z.object({
  query:z.string().trim().min(3).max(255),
  exclude:excludeIdsSchema.optional(),
  limit:z.union([z.number().min(1).max(100), z.string().transform((val)=>parseInt(val)).transform((val)=>isNaN(val) ? 10 : val).transform((val)=>Math.max(1, Math.min(100, val))).optional().transform((val)=>val ?? 10)]).optional(),
})

export type SearchUsersQuery = z.infer<typeof searchUsersQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserSchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;