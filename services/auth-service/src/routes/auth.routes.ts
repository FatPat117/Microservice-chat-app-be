import { loginHandler, refreshTokensHandler, registerHandler, revokeRefreshTokenHandler } from "@/controllers/auth.controller";
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from "@/routes/auth.schema";
import { validateRequest } from "@chatapp/common";
import { Router } from "express";

export const authRouter:Router = Router();
authRouter.post("/register",validateRequest({body:registerSchema.shape.body}),registerHandler)
authRouter.post("/login",validateRequest({body: loginSchema.shape.body}),loginHandler)
authRouter.post("/refresh",validateRequest({body:refreshSchema.shape.body}),refreshTokensHandler)
authRouter.post("/revoke",validateRequest({body:revokeSchema.shape.body}),revokeRefreshTokenHandler)
