import type { Router } from "express";
import { userRouter } from "./user.routes";

export const registerRoutes = (app:Router) =>{
  app.use("/users",userRouter);
}