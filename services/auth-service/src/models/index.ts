import { sequelize } from "../db/sequelize";
import { logger } from "../utils/logger";
import RefreshToken from "./refresh-token.model";

import UserCredentials from "./user-credentials.model";

export const initModels = async () =>{
  await sequelize.sync();
  logger.info("Models synchronized");
}

export { RefreshToken, UserCredentials };

