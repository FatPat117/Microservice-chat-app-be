import axios from "axios";

import { env } from "@/configs/env";
import { HttpError } from "@chatapp/common";

const client  = axios.create({
  baseURL: env.USER_SERVICE_URL,
  timeout:5000
})

const authHeader = {
  headers:{
   'X-Internal-Token': env.INTERNAL_API_TOKEN
  },
 } as const


 export interface UserDTO{
  id:string,
  email:string,
  displayName:string,
  createdAt:string,
  updatedAt:string,
 }

 export interface UserResponse{
  data:UserDTO,
 }

 export interface UsersListResponse{
  data:UserDTO[],
 }

export interface CreateUserPayload{
  email:string,
  displayName:string,
}

export interface SearchUsersParams{
  query:string,
  limit?:number,
  exclude?:string[],
}


const resolvedMessage = (status:number,data:unknown):string =>{
  if(typeof data === 'object' && data !== null && "message" in data ){
    const message = (data as Record<string,unknown>).message 
    if(typeof message === 'string' &&message.trim().length>0){
      return message
    }
  }
  return status >= 500 ? "User service is not available" : "An error occurred while processing your request";
}


const handleAxiosError = (error:unknown):never =>{
  if(!axios.isAxiosError(error) || !error.response){
    throw new HttpError(500,"User service is not available");
  }
const {status,data} = error.response as {status:number, data:unknown}

throw new HttpError(status,resolvedMessage(status,data),data as Record<string,unknown>);
}


export const userProxyService ={
  async getUserById(id:string):Promise<UserResponse>{
    try {
      const response = await client.get<UserResponse>(`/users/${id}`, authHeader );
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },

  async getAllUsers():Promise<UsersListResponse>{
    try {
      const response = await client.get<UsersListResponse>(`/users`, authHeader );
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  
  async createUser(payload:CreateUserPayload):Promise<UserResponse>{
    try {
      const response = await client.post<UserResponse>(`/users`, payload, authHeader );
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  
  async searchUsers(params:SearchUsersParams):Promise<UsersListResponse>{
    try {
      const response = await client.get<UsersListResponse>(`/users/search`, {
        headers: authHeader.headers,
        params:{
          query:params.query,
          ...(params.limit ? {limit:params.limit} : {}),
          ...(params.exclude && params.exclude.length > 0 ? {exclude:params.exclude} : {}),
        }
      });
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
  
}