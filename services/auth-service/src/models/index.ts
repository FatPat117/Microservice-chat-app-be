import { sequelize } from "../db/sequelize";
import { logger } from "../utils/logger";
import UserCredentials from "./user-credentials.model";
import type {
  UserCredentialsAttributes,
  UserCredentialsCreationAttributes,
} from "./user-credentials.model";

export const initModels = async () =>{
  await sequelize.sync();
  logger.info("Models synchronized");
}

export { UserCredentials, UserCredentialsAttributes, UserCredentialsCreationAttributes };
