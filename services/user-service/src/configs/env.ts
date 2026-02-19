import 'dotenv/config';

import { createEnv, z } from '@chatapp/common';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USER_SERVICE_PORT: z
    .coerce.number()
    .int()
    .positive()
    .min(0)
    .max(65_535)
    .default(4000), 
  USER_DB_URL: z.string().url(),
  USER_DB_SSL: z.coerce.boolean().default(false),
  INTERNAL_API_TOKEN: z.string().min(6),
  RABBITMQ_URL: z.string().url().optional(),
});

export const env = createEnv(EnvSchema.shape, { serviceName: 'user-service' });

export type Env = typeof env;
