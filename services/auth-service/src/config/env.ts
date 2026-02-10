import 'dotenv/config';

import { createEnv, z } from '@chatapp/common';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SERVICE_PORT: z
    .coerce.number()
    .int()
    .positive()
    .min(0)
    .max(65_535)
    .default(4003),
  AUTH_DB_URL: z.string().url(),
  AUTH_DB_SSL: z.coerce.boolean().default(false),
});

export const env = createEnv(EnvSchema.shape, { serviceName: 'auth-service' });

export type Env = typeof env;
