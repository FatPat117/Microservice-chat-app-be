import { USER_ID_HEADER, z } from "@chatapp/common";
import type { Request, Response, NextFunction } from "express";

const userIdSchema = z.string().uuid();

export const attachAuthenticatedUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const headerValue = req.header(USER_ID_HEADER);
    const userId = userIdSchema.parse(headerValue);
    req.user = {id:userId};
    next()
  } catch (error) {
    return next(error);
  }
}