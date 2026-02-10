import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodIssue, type ZodObject, type ZodTypeAny } from 'zod';
import { HttpError } from '../errors/http-error';
type Schema = ZodObject<any, any> | ZodTypeAny;
type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

const formatedError = (error:ZodError) => {
  return error.issues.map((err:ZodIssue) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
}

export const validateRequest = (schemas:RequestValidationSchemas) => {
  return (req:Request,res:Response,next:NextFunction) => {
   try {
      if(schemas.body){
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if(schemas.params){
        const parsedParams = schemas.params.parse(req.params) as ParamsRecord;
        req.params = parsedParams as Request['params'];
      }

      if(schemas.query){
        const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
   } catch (error) {
      if(error instanceof ZodError){
        const formatedErrors = formatedError(error);
        throw new HttpError(400, "Validation failed", {errors:formatedErrors});
      }
      throw error;
   }
  }
}