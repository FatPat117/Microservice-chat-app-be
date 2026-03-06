import type { Router } from "express";
import conversationRouter from "./conversation.routes";

export const registerRoutes = (app:Router) =>{
  app.use("/conversations",conversationRouter);
}