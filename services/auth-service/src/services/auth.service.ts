import { sequelize } from "@/db/sequelize";
import { publishUserRegisteredEvent } from "@/messaging/event-publishing";
import { RefreshToken, UserCredentials } from "@/models";
import { RefreshTokenAttributes } from "@/models/refresh-token.model";
import { AuthResponse, AuthToken, LoginInput, RegisterInput } from "@/types/auth";
import { hashPassword, signAccessToken, signRefreshToken, verifyPassword, verifyRefreshToken } from "@/utils/token";
import { HttpError } from "@chatapp/common";
import crypto from "crypto";
import { Op, Transaction } from "sequelize";

const REFRESH_TOKEN_TTL_DAYS=30
const createRefreshToken = async (userId:string, transaction?:Transaction): Promise<RefreshTokenAttributes>  => {
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


export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const credential = await UserCredentials.findOne({
    where: { email: { [Op.eq]: input.email } },
  });
  
  if(!credential){
    throw new HttpError(401, "Invalid credentials");
  }
  
  const isPasswordValid = await verifyPassword(input.password, credential.passwordHash);
  
  if(!isPasswordValid){
    throw new HttpError(401, "Invalid credentials");
  }

  const refreshTokenRecord = await createRefreshToken(credential.id);

  const accessToken = signAccessToken({sub:credential.id, email:credential.email});
  const refreshToken = signRefreshToken({sub:credential.id, tokenId:refreshTokenRecord.tokenId});

  const userData = {
    id: credential.id,
    email: credential.email,
    displayName: credential.displayName,
    createdAt: credential.createdAt.toISOString(),
  };

  return {
    accessToken,
    refreshToken,
    user:userData,
  }
}


export const refreshTokens = async (refreshToken:string): Promise<AuthToken> => {
  const payload = verifyRefreshToken(refreshToken);

  const tokenRecord = await RefreshToken.findOne({
    where: { tokenId: payload.tokenId,userId: payload.sub },
  });
  
  // check if token is valid
  if(!tokenRecord){
    throw new HttpError(401, "Invalid token");
  }

  if(tokenRecord.expiresAt.getTime() < Date.now()){
    await tokenRecord.destroy();
    throw new HttpError(401, "Token expired");
  }

  //  Check user is still valid
  const credential = await UserCredentials.findOne({
    where: { id: payload.sub },
  });
  
  if(!credential){
    throw new HttpError(401, "User not found");
  }
  // destroy old token
  await tokenRecord.destroy();

  const newRefreshTokenRecord = await createRefreshToken(credential.id);
  const accessToken = signAccessToken({sub:credential.id, email:credential.email});
  const newRefreshToken = signRefreshToken({sub:credential.id, tokenId:newRefreshTokenRecord.tokenId});

  return {
    accessToken,
    refreshToken:newRefreshToken,
  }
}

export const revokeRefreshToken = async (userId:string): Promise<void> => {
  await RefreshToken.destroy({
    where: { userId: userId },
  });
}