import { register } from "@/services/auth.service";
import { RegisterInput } from "@/types/auth";
import { asyncHandler } from "@chatapp/common";
import type { RequestHandler } from "express";

export const registerHandler: RequestHandler = asyncHandler(async (req, res, next) => {
  const payload = req.body as RegisterInput;
  const tokens = await register(payload);
  res.status(201).json(tokens);
});