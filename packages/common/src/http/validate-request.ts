import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodIssue, type ZodObject, type ZodTypeAny } from 'zod';
import { HttpError } from '../errors/http-error';

/**
 * Kiểu schema tổng quát dùng cho body/params/query (Zod object hoặc bất kỳ Zod type nào).
 */
type Schema = ZodObject<any, any> | ZodTypeAny;

type ParamsRecord = Record<string, string>;
type QueryRecord = Record<string, unknown>;

/**
 * Tập hợp các schema Zod dùng để validate từng phần của request.
 * - body: validate req.body
 * - params: validate req.params
 * - query: validate req.query
 */
export interface RequestValidationSchemas {
  body?: Schema;
  params?: Schema;
  query?: Schema;
}

/**
 * Chuyển ZodError thành mảng error đơn giản:
 * - path: đường dẫn tới field bị lỗi (VD: "user.email").
 * - message: thông điệp lỗi đã được Zod format.
 */
const formatedError = (error: ZodError) => {
  return error.issues.map((err: ZodIssue) => ({
    path: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Middleware factory để validate request bằng Zod.
 *
 * - Nhận vào các schema cho body/params/query.
 * - Nếu validate thành công: gán lại các field đã parse (đã được Zod cast/coerce) vào req.
 * - Nếu validate thất bại: ném HttpError 400 với danh sách lỗi đã format.
 */
export const validateRequest = (schemas: RequestValidationSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        const parsedBody = schemas.body.parse(req.body) as unknown;
        req.body = parsedBody;
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as ParamsRecord;
        req.params = parsedParams as Request['params'];
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as QueryRecord;
        req.query = parsedQuery as Request['query'];
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatedErrors = formatedError(error);
        throw new HttpError(400, 'Validation failed', { errors: formatedErrors });
      }
      throw error;
    }
  };
}