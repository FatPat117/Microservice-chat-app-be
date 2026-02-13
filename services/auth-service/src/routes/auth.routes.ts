import { registerHandler } from "@/controllers/auth.controller";
import { registerSchema } from "@/routes/auth.schema";
import { validateRequest } from "@chatapp/common";
import { Router } from "express";

export const authRouter:Router = Router();
authRouter.post("/register",validateRequest({body:registerSchema.shape.body}),registerHandler)