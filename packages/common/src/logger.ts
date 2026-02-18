import type { Logger, LoggerOptions } from 'pino';
import pino from 'pino';

/**
 * Ví dụ usage:
 * ```ts
 * import { createLogger } from '@chatapp/common';
 *
 * export const logger = createLogger({ name: 'auth-service' });
 *
 * logger.info('Service started');
 * logger.error({ err }, 'Failed to connect to DB');
 * ```
 */
type CreateLoggerOptions = LoggerOptions & {
  /**
   * Tên service/logger, sẽ xuất hiện trong log để dễ trace.
   */
  name: string;
};

/**
 * Tạo instance pino Logger với một số cấu hình mặc định cho project.
 *
 * - Ở môi trường development: dùng transport "pino-pretty" để log dễ đọc (màu sắc, thời gian đẹp).
 * - Ở môi trường khác: log ở dạng JSON thô, phù hợp cho log collector (ELK, Loki, v.v.).
 * - Level mặc định lấy từ LOG_LEVEL hoặc 'info'.
 */
export const createLogger = (options: CreateLoggerOptions): Logger => {
  const { name, ...rest } = options;

  const transport =
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined;

  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    ...rest,
    transport,
  });
}