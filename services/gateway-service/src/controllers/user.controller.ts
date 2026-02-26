import { userProxyService } from "@/services/user-proxy-service";
import { getAuthenticatedUser } from "@/utils/auth";
import { SearchUsersQuery, createUserSchema, searchUsersQuerySchema, userIdParamsSchema } from "@/validation/user.schema";
import { AsyncHandler } from "@chatapp/common";

export const getUserById: AsyncHandler = async (req, res, next) => {
  try {
    const {id} = userIdParamsSchema.parse(req.params);
    const response = await userProxyService.getUserById(id);
    res.status(200).json(response);
  } catch (error) {
    return next(error)
  }
}

export const getAllUsers: AsyncHandler = async (req, res, next) => {
  try {
    const response = await userProxyService.getAllUsers();
    res.status(200).json(response);
  } catch (error) {
    return next(error)
  }
}


export const createUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const response = await userProxyService.createUser(payload);
    res.status(201).json(response);
  } catch (error) {
    return next(error)
  }
}

export const searchUsers: AsyncHandler = async (req, res, next) => {
  try {
    const user = getAuthenticatedUser(req);
    const parsedQuery:SearchUsersQuery = searchUsersQuerySchema.parse(req.query);
    const {query, limit, exclude} = parsedQuery;
    const sanitizedExclude = Array.from(new Set([...(exclude ?? []),user.id]))
    const response = await userProxyService.searchUsers({
      query,
      limit,
      exclude:sanitizedExclude,
    });
    res.status(200).json(response);
  } catch (error) {
    return next(error)
  } 
}