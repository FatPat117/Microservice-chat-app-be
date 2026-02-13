import { authRouter } from "@/routes/auth.routes";
import { Router } from "express";

export const registerRoutes = (app:Router) =>{
  app.use("/auth",authRouter);
}

