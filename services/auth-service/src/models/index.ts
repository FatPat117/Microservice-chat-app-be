import { sequelize } from "../db/sequelize";
import { logger } from "../utils/logger";
import RefreshToken from "./refresh-token.model";

import { env } from "@/configs/env";
import UserCredentials from "./user-credentials.model";

export const initModels = async () =>{
  const syncOptions = env.NODE_ENV === 'development' ? { force: false, alter: false } :  { force: true, alter: true };
  await sequelize.sync(syncOptions  );
  logger.info("Models synchronized");
} 

export { RefreshToken, UserCredentials };

