import { UserModel } from "@/db";
import type { User } from "@/types/user";
import type { AuthUserRegisteredPayload } from "@chatapp/common";

const toDomainUser = (model:UserModel):User =>{
 return {
  id:model.id,
  email:model.email,
  displayName:model.displayName,
  createdAt:model.createdAt,
  updatedAt:model.updatedAt,
 }
}


export class UserRepository{
  async findById(id:string):Promise<User | null>{
    const user = await UserModel.findByPk(id);
    return user ? toDomainUser(user) : null;
  }

  async findAll():Promise<User[]>{
    const users = await UserModel.findAll({
      order:[["createdAt", "DESC"]],
    });
    return users.map(toDomainUser);
  }

  async upsertFromAuthEvent(payload:AuthUserRegisteredPayload):Promise<User>{
    const [user] = await UserModel.upsert({
      id:payload.id,
      email:payload.email,
      displayName:payload.displayName,
      createdAt:new Date(payload.createdAt),
      updatedAt:new Date(payload.createdAt),
    },{returning:true});
    return toDomainUser(user);
  }
}

export const userRepository = new UserRepository();