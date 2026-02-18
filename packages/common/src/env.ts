import { ZodObject, ZodRawShape, z } from "zod";

/**
 * Options cho hàm createEnv.
 * - source: nguồn env để đọc (mặc định là process.env, có thể stub trong test).
 * - serviceName: tên service dùng để prefix message lỗi khi validate env fail.
 */
interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serviceName?: string;
}

/**
 * Kết quả đầu ra tương ứng với ZodRawShape đã khai báo.
 */
type SchemaOutput<T extends ZodRawShape> = ZodObject<T>["_output"];

/**
 * Helper dùng Zod để validate biến môi trường cho từng service.
 *
 * Ví dụ usage trong một service:
 * ```ts
 * const EnvSchema = z.object({
 *   NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
 *   PORT: z.coerce.number().int().positive().default(4000),
 * });
 *
 * export const env = createEnv(EnvSchema.shape, { serviceName: 'gateway-service' });
 * ```
 *
 * Nếu validate thất bại sẽ ném Error với message chứa đầy đủ thông tin lỗi.
 */
export const createEnv = <T extends ZodRawShape>(
  schema: T,
  options?: EnvOptions
): SchemaOutput<T> => {
  const { source = process.env, serviceName = "service" } = options || {};

  const parsed = z.object(schema).safeParse(source);

  if (!parsed.success) {
    const formatedErrors = parsed.error.format();
    throw new Error(
      `[${serviceName}] Environment variables validation failed: ${JSON.stringify(
        formatedErrors,
        null,
        2
      )}`
    );
  }

  return parsed.data;
};

/**
 * Kiểu tiện ích nếu bạn muốn giữ nguyên ZodObject schema cho env.
 */
export type EnvSchema<T extends ZodRawShape> = ZodObject<T>;
