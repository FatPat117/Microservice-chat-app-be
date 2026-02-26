import type { UserRepository } from "@/repositories/user.repository";
import type { CreateUserInput, User } from "@/types/user";

import { publishUserCreatedEvent } from "@/messaging/event-publisher";
import { userRepository } from "@/repositories/user.repository";
import { AuthUserRegisteredPayload, HttpError, UserCreatedPayload } from "@chatapp/common";
import { UniqueConstraintError } from "sequelize";

class UserService{
  constructor(private readonly repository:UserRepository){}

  // Sync User From Auth Service
  async syncFromAuthUser(payload:AuthUserRegisteredPayload):Promise<User>{
    const user = await this.repository.upsertFromAuthEvent(payload);
    
    void publishUserCreatedEvent({
      id:user.id,
      email:user.email,
      displayName:user.displayName,
      createdAt:user.createdAt.toISOString(),
    } as UserCreatedPayload)
    return user;
  }

  // Get user by Id
  async getUserById(id:string):Promise<User | null>{
    const user = await this.repository.findById(id);

    if(!user){
      throw new HttpError(404, "User not found");
    }
    return user;
  }

  // Get All Users
  async getAllUsers():Promise<User[]>{
    const users = await this.repository.findAll();
    return users;
  }

  // Create User
  async createUser(input:CreateUserInput):Promise<User>{
    try {
      const user = await this.repository.create(input);

      void publishUserCreatedEvent({
        id:user.id,
        email:user.email,
        displayName:user.displayName,
        createdAt:user.createdAt.toISOString(),
      } as UserCreatedPayload)
      
    return user;
    } catch (error) {
      if(error instanceof UniqueConstraintError){
        throw new HttpError(400, "Email already exists");
      }
      throw error;
    }
  }

  // Search Users
  async searchUsers(params:{query:string, limit?:number, excludeIds?:string[] }):Promise<User[]>{
    const query = params.query.trim();

    if(query.length == 0){
      return []
    }
    const limit = params.limit ?? 10;
    const excludeIds = params.excludeIds ?? [];
    const users = await this.repository.searchByQuery(query, {limit, excludeIds});
    return users;
  }

}

export const userService = new UserService(userRepository);
