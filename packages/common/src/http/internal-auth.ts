import { RequestHandler } from "express";
import { HttpError } from "../errors/http-error";

/**
 * Tuỳ chọn cho middleware xác thực nội bộ giữa các service.
 */
export interface InternalAuthOptions {
  /**
   * Tên header chứa token nội bộ.
   * - Mặc định: "x-internal-token".
   * - Không phân biệt hoa/thường vì header sẽ được convert về lowercase trong Node.
   */
  headerName?: string;
  /**
   * Danh sách các path được miễn xác thực (ví dụ: healthcheck).
   */
  exemptPath?: string[];
}

/**
 * Tên header mặc định dùng để truyền token nội bộ giữa các service.
 */
const DEFAULT_HEADER_NAME = "x-internal-token";

/**
 * Tạo middleware xác thực internal cho Express.
 *
 * - expectedToken: giá trị token hợp lệ (thường lấy từ biến môi trường).
 * - options.headerName: đổi tên header nếu không muốn dùng mặc định.
 * - options.exemptPath: bỏ qua kiểm tra cho một số route nhất định.
 *
 * Middleware sẽ:
 * - Đọc token từ header tương ứng.
 * - So sánh với expectedToken.
 * - Nếu sai hoặc thiếu → ném HttpError 401 "Unauthorized".
 */
export const createInternalAuthMiddleware = (
  expectedToken: string,
  options: InternalAuthOptions = {}
): RequestHandler => {
  const headerName = options.headerName?.toLowerCase() ?? DEFAULT_HEADER_NAME;
  const exemptPath = new Set(options.exemptPath ?? []);

  return (req, _res, next) => {
    if (exemptPath.has(req.path)) {
      return next();
    }

    const provided = req.headers[headerName];
    const token = Array.isArray(provided) ? provided[0] : provided;

    if (typeof token !== "string" || token !== expectedToken) {
      throw new HttpError(401, "Unauthorized");
    }

    next();
  };
}