import { login, refreshTokens, register, revokeRefreshToken } from "@/services/auth.service";
import { LoginInput, RegisterInput } from "@/types/auth";
import { HttpError, asyncHandler } from "@chatapp/common";
import type { RequestHandler } from "express";

export const registerHandler: RequestHandler = asyncHandler(async (req, res, _next) => {
  const payload = req.body as RegisterInput;
  const tokens = await register(payload);
  res.status(201).json(tokens);
});

export const loginHandler: RequestHandler = asyncHandler(async (req, res, _next) => {
  const payload = req.body as LoginInput;
  const tokens = await login(payload);
  res.status(200).json(tokens);
})

export const refreshTokensHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;
  if(!refreshToken){
    return next(new HttpError(400, "Refresh token is required"));
  }
  const tokens = await refreshTokens(refreshToken);
  res.status(200).json(tokens);
})

export const revokeRefreshTokenHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const userId = req.body.userId;
  if(!userId){
    return next(new HttpError(401, "Unauthorized"));
  }
  await revokeRefreshToken(userId);
  res.status(204).json({message:"Refresh token revoked"});
})