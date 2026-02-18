import { RequestHandler } from "express";
import { HttpError } from "../errors/http-error";

export interface InternalAuthOptions{
  headerName?:string,
  exemptPath?:string[], // array of paths to exempt from authentication
}

const DEFAULT_HEADER_NAME = "x-internal-token";

export const createInternalAuthMiddleware = (expectedToken:string,options:InternalAuthOptions = {}):RequestHandler => {
 const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
 const exemptPath = new Set(options.exemptPath ?? []);

 return (req,_res,next) =>{
  if(exemptPath.has(req.path)){
    return next();
  }

  const provided = req.headers[headerName];
  const token = Array.isArray(provided) ? provided[0] : provided;

  if(typeof token !== "string" || token !== expectedToken){
    throw new HttpError(401,"Unauthorized");
  }

  next();
  
 }
}