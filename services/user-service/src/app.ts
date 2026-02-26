import { env } from "@/configs/env";
import { createInternalAuthMiddleware } from "@chatapp/common";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import { errorHandler } from "./middleware/error-handler";
import { registerRoutes } from "./routes";

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
  app.use(createInternalAuthMiddleware(env.INTERNAL_API_TOKEN ?? "",{exemptPath:["/users/health"]}))

  registerRoutes(app);
  app.use((_req,res) =>{
    res.status(404).json({message:"Not found"});
  })

  app.use(errorHandler);

  return app;
}