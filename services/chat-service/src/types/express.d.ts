 import type { AuthenticatedUser } from "@chatapp/common";

/**
 * Thêm user vào request object để dùng trong các middleware và controller.
 */

 declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
 }

 export { };
