import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Kiểu handler chuẩn cho các route async.
 * - Luôn trả về Promise<void> để có thể .catch và forward lỗi về middleware xử lý lỗi.
 */
export type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/**
 * Hàm forward lỗi vào Express `next(err)` với type rõ ràng.
 */
type ErrorForwarder = (err: Error) => void;

/**
 * Chuẩn hoá mọi kiểu lỗi về instance của Error.
 * - Nếu đã là Error thì giữ nguyên.
 * - Nếu là primitive/unknown khác thì wrap vào Error với message string.
 */
const toError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
};

/**
 * Chuyển lỗi bất kỳ thành Error rồi gọi `next(err)` tương ứng.
 */
const forwardError = (nextFn: ErrorForwarder, error: unknown): void => {
  const err = toError(error);
  nextFn(err);
};

/**
 * Wrapper cho async handler:
 * - Nhận vào một `AsyncHandler`.
 * - Trả về `RequestHandler` sync cho Express.
 * - Tự `.catch` lỗi async và forward về middleware lỗi qua `next(err)`.
 */
export const asyncHandler = (handler: AsyncHandler): RequestHandler => {
  return (req, res, next) => {
    handler(req, res, next).catch(err => forwardError(next, err));
  };
};

