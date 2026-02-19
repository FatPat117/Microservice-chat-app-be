import { sequelize } from "@/db/sequelize";
import { publishUserRegisteredEvent } from "@/messaging/event-publishing";
import { RefreshToken, UserCredentials } from "@/models";
import { AuthResponse, RegisterInput } from "@/types/auth";
import { hashPassword, signAccessToken, signRefreshToken } from "@/utils/token";
import { HttpError } from "@chatapp/common";
import crypto from "crypto";
import { Op, Transaction } from "sequelize";

const REFRESH_TOKEN_TTL_DAYS=30
const createRefreshToken = async (userId:string, transaction?:Transaction) => {
  const expiresAt = new Date(Date.now());
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS); // 30 days from now

  const tokenId = crypto.randomUUID();

  const record = await RefreshToken.create(
{    userId,
    tokenId,
    expiresAt},{
      transaction
    }
  )
return record;

}

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await UserCredentials.findOne({
    where: { email: { [Op.eq]: input.email } },
  });
  
  if(existingUser){
    throw new HttpError(400, "User already exists");
  }
 
  const transaction = await sequelize.transaction();

  try {
    const passwordHash = await hashPassword(input.password);
    const user = await UserCredentials.create({
      email: input.email,
      displayName: input.displayName,
      passwordHash,
    }, { transaction });

    const refreshTokenRecord = await createRefreshToken(user.id, transaction);

    await transaction.commit();

    const accessToken = signAccessToken({sub:user.id, email:user.email});
    const refreshToken = signRefreshToken({sub:user.id, tokenId:refreshTokenRecord.tokenId});

    const userData = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      createdAt: user.createdAt.toISOString(),
    };

    await publishUserRegisteredEvent(userData); // Publish event UserRegistered

    return {
      accessToken,
      refreshToken,
      user:userData,
    }
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
