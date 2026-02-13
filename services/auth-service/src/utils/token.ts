import { env } from '@/config/env';
import bcrypt from 'bcrypt';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET:Secret = env.JWT_SECRET;
const REFRESH_TOKEN_SECRET:Secret = env.JWT_REFRESH_SECRET;
export const ACCESS_OPTIONS:SignOptions = {expiresIn:env.JWT_EXPIRES_IN as SignOptions['expiresIn']}
export const REFRESH_OPTIONS:SignOptions = {expiresIn:env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']}

export interface AccessTokenPayload{
  sub:string, // userId
  email:string;
}

export interface RefreshTokenPayload{
  sub:string, // userId
  tokenId:string;
}



export const hashPassword = async(password:string):Promise<string> => {
  const saltRound = 12;
  return await bcrypt.hash(password, 12);
}

export const verifyPassword = async(password:string, hash:string):Promise<boolean> => {
  return await bcrypt.compare(password, hash);
}

export const signAccessToken = (payload:AccessTokenPayload):string =>{
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, ACCESS_OPTIONS);
}

export const signRefreshToken = (payload:RefreshTokenPayload):string =>{
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, REFRESH_OPTIONS);
}

export const verifyAccessToken = (token:string):AccessTokenPayload =>{
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export const verifyRefreshToken = (token:string):RefreshTokenPayload =>{
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}