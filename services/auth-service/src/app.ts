import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler";
import { registerRoutes } from "./routes";
import { createInternalAuthMiddleware } from "@chatapp/common";
import { env } from "./configs/env";

export const createApp = () : Application => {
  const app = express();

  app.use(helmet());
  app.use(cors(
    {origin: "*",
      credentials:true,
    }
  ));
  app.use(express.json());
  app.use(express.urlencoded({extended:true}));
  // Simple health check endpoint (no auth)
  app.get("/health", (_req, res) =>{
    res.status(200).json({status:"ok"});
  });
  app.use(createInternalAuthMiddleware(env.INTERNAL_API_TOKEN))

  registerRoutes(app);

  app.use((_req,res) =>{
    res.status(404).json({message:"Not found"});
  })

  app.use(errorHandler);

  return app;
}