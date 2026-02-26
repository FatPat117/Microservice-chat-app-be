import { authProxyService } from "@/services/auth-proxy-service";
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from "@/validation/auth.schema";
import type { AsyncHandler } from "@chatapp/common";

export const registerUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const response = await authProxyService.register(payload);
    res.status(201).json(response);
  } catch (error) {
    return next(error)
  }

};

export const loginUser: AsyncHandler = async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const response = await authProxyService.login(payload);
    res.status(200).json(response);
  } catch (error) {
    return next(error)
  }
}

export const refreshTokens: AsyncHandler = async (req, res, next) => {
  try {
    const payload = refreshSchema.parse(req.body);
    const response = await authProxyService.refreshTokens(payload);
    res.status(200).json(response);
  } catch (error) {
    return next(error)
  }
}

export const revokeRefreshToken: AsyncHandler = async (req, res, next) => {
  try {
    const payload = revokeSchema.parse(req.body);
    const response = await authProxyService.revokeRefreshToken(payload);
    res.status(204).json({message:"Refresh token revoked"});
  } catch (error) {
    return next(error)
  }
}