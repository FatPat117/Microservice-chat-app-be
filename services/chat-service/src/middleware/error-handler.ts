import { logger } from "@/utils/logger";
import { HttpError } from "@chatapp/common";
import type { ErrorRequestHandler } from "express";

export const errorHandler:ErrorRequestHandler = (err,req,res,next) =>{
  logger.error({err},"An unexpected error occurred");
  const error = err instanceof HttpError ? err : new HttpError(500,"Internal server error");
  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? "Internal server error" : error?.message ?? "Unknown Error";
  const payload = error?.details ? {message,details:error.details} : {message};

  res.status(statusCode).json(payload); 

  void next();
}