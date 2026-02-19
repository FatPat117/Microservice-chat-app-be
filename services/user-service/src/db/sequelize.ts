import { env } from "@/configs/env";
import { logger } from "@/utils/logger";
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(env.USER_DB_URL,{
  dialect:"postgres",
  logging: env.NODE_ENV === 'development' ? (mgs:unknown) => logger.debug(mgs as string) : false,
  define:{
    underscored:true,
    freezeTableName:true 
  },
  ssl: env.USER_DB_SSL,
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
    logger.info("User service Connected to database");
  } catch (error) {
    logger.error(`User service Failed to connect to database ${error}`,);
    throw error;
  }
};

export const disconnectFromDatabase = async () =>{
  try {
    await sequelize.close();
    logger.info("User service Disconnected from database");
  } catch (error) {
    logger.error(`User service Failed to disconnect from database ${error}`,);
    throw error;
  }
};
