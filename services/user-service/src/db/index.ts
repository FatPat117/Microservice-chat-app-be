import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { sequelize } from "./sequelize";
export * from "./models/user.model";
export * from "./sequelize";

export const initModels = async () =>{
  const syncOptions = env.NODE_ENV === 'development' ? { force: false, alter: false } :  { force: true, alter: true };
  await sequelize.sync(syncOptions  );
  logger.info("Models synchronized");
} 