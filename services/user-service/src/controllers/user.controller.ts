import { userService } from "@/services/user.service";
import { CreateUserInput } from "@/types/user";
import { SearchUsersQuery, UserIdParams } from "@/validation/user.schema";
import { HttpError } from "@chatapp/common";
import type { NextFunction, Request, Response } from "express";

type AsyncHandlerLocal = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const getUserById : AsyncHandlerLocal =async (req, res,next:NextFunction) =>{
try {
    const {id} = req.params as unknown as UserIdParams;
    const user = await userService.getUserById(id);
    if(!user){
      throw new HttpError(404, 'User not found');
    }
    res.status(200).json(user);
} catch (error) {
  next(error);
}
}

export const getAllUsers : AsyncHandlerLocal = async (_req, res,next:NextFunction) =>{
try {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
} catch (error) {
  next(error);
}
}

export const createUser : AsyncHandlerLocal = async (req, res,next:NextFunction) =>{
try {
  const {email, displayName} = req.body as unknown as CreateUserInput;
  const user = await userService.createUser({email, displayName} as CreateUserInput);
  res.status(201).json(user);
} catch (error) {
  next(error);
}
}

export const searchUsers : AsyncHandlerLocal = async (req, res,next:NextFunction) =>{
try {
  const {query, exclude, limit} = req.query as unknown as SearchUsersQuery;
  const users = await userService.searchUsers({query, excludeIds:exclude, limit});
  res.status(200).json(users);
} catch (error) {
  next(error);
}
} 