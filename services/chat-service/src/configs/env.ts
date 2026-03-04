import 'dotenv/config';

import { createEnv, z } from '@chatapp/common';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CHAT_SERVICE_PORT: z
    .coerce.number()
    .int()
    .positive()
    .min(0)
    .max(65_535)
    .default(4000),
    JWT_SECRET: z.string().min(6),
    INTERNAL_API_TOKEN: z.string().min(6),
    RABBITMQ_URL: z.string().url().optional(),
    MONGO_URL: z.string().url(),
    REDIS_URL: z.string().url().optional(),
});

export const env = createEnv(EnvSchema.shape, { serviceName: 'chat-service' });

export type Env = typeof env;
