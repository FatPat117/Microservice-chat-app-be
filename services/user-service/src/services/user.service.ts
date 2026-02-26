import type { UserRepository } from "@/repositories/user.repository";
import type { User,CreateUserInput } from "@/types/user";

import {userRepository} from "@/repositories/user.repository";
import { AuthUserRegisteredPayload } from "@chatapp/common";

class UserService{
  constructor(private readonly repository:UserRepository){}

  async syncFromAuthUser(payload:AuthUserRegisteredPayload):Promise<User>{
    const user = await this.repository.upsertFromAuthEvent(payload);

    return user;
  }

}

export const userService = new UserService(userRepository);
