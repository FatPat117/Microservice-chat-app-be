import { createUser, getAllUsers, getUserById, searchUsers } from "@/controllers/user.controller";
import { createUserSchema, searchUsersQuerySchema, userIdParamsSchema } from "@/validation/user.schema";
import { asyncHandler, validateRequest } from "@chatapp/common";
import { Router } from "express";

export const userRouter:Router = Router();

userRouter.get('/:id',validateRequest({params:userIdParamsSchema}),asyncHandler(getUserById))
userRouter.get('/',asyncHandler(getAllUsers))
userRouter.post('/',validateRequest({body:createUserSchema}),asyncHandler(createUser))
userRouter.get('/search',validateRequest({query:searchUsersQuerySchema}),asyncHandler(searchUsers))
