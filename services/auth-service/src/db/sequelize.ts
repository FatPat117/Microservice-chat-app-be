import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(env.AUTH_DB_URL,{
  dialect:"mysql",
  logging: env.NODE_ENV === 'development' ? (mgs:unknown) => logger.debug(mgs as string) : false,
  define:{
    underscored:true,
    freezeTableName:true 
  },
  ssl: env.AUTH_DB_SSL,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
})


export const connectToDatabase = async () =>{
  try {
    await sequelize.authenticate();

    logger.info("Auth service Connected to database");
  } catch (error) {
    logger.error(`Auth service Failed to connect to database ${error}`,);
    throw error;
  }
};

export const disconnectFromDatabase = async () =>{
  try {
    await sequelize.close();
    logger.info("Auth service Disconnected from database");
  } catch (error) {
    logger.error(`Auth service Failed to disconnect from database ${error}`,);
    throw error;
  }
};
