import { env } from "@/configs/env";
import { AuthenticatedUser, HttpError } from "@chatapp/common";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface AccessTokenClaims{
  sub:string, // userId
  email?:string;
}

const parseAuthorizationHeader = (value:string | undefined): string =>{
  if(!value){
    throw new HttpError(401, 'Unauthorized');
  }

  const [scheme,token] = value.split(' ');

  if(scheme.toLowerCase() !== 'bearer' || !token || token.trim().length === 0){
    throw new HttpError(401, 'Unauthorized');
  }

  return token;
}

const toAuthenticatedUser = (claims:AccessTokenClaims):AuthenticatedUser =>{
  if(!claims.sub){
    throw new HttpError(401, 'Unauthorized');
  }

  return {
    id:claims.sub,
    email:claims.email,
  
}
}

export const requireAuthMiddleware:RequestHandler = (req, res, next) =>{
  try {
    const token = parseAuthorizationHeader(req.headers.authorization);
    const claims = jwt.verify(token, env.JWT_SECRET) as AccessTokenClaims;
    req.user = toAuthenticatedUser(claims);
    next();
  } catch (error) {
    return next(error);
  }
}