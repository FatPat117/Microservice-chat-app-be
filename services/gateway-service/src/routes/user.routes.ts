import { createUser, getAllUsers, getUserById, searchUsers } from "@/controllers/user.controller";
import { requireAuthMiddleware } from "@/middleware/require-auth";
import { createUserSchema, searchUsersQuerySchema, userIdParamsSchema } from "@/validation/user.schema";
import { asyncHandler, validateRequest } from "@chatapp/common";
import { Router } from "express";

export const userRouter:Router = Router();

userRouter.get('/:id',requireAuthMiddleware ,validateRequest({params:userIdParamsSchema}),asyncHandler(getUserById))
userRouter.get('/',requireAuthMiddleware,asyncHandler(getAllUsers))
userRouter.post('/',validateRequest({body:createUserSchema}),asyncHandler(createUser))
userRouter.get('/search',requireAuthMiddleware,validateRequest({query:searchUsersQuerySchema}),asyncHandler(searchUsers))
