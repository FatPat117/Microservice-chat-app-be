import type { NextFunction, Request, RequestHandler, Response } from "express";

export type AsyncHandler = (req:Request,res:Response,next:NextFunction) => Promise<void>;
type ErrorForwarder = (err:Error) => void;


const toError = (err:unknown):Error => {
  if(err instanceof Error){
    return err;
  }
  return new Error(String(err));
}

const forwardError = (nextFn:ErrorForwarder,error:unknown):void => {
  const err = toError(error);
  nextFn(err);
}

export const asyncHandler = (handler:AsyncHandler):RequestHandler => {
  return (req,res,next) => {
    handler(req,res,next).catch(err => forwardError(next,err));
  }
}

