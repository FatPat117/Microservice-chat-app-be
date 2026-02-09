import 'dotenv/config';

import { createEnv } from '@chatapp/common';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SERVICE_PORT: z
    .coerce.number()
    .int()
    .positive()
    .min(0)
    .max(65_535)
    .default(4003),
});

export const env = createEnv(EnvSchema.shape, { serviceName: 'auth-service' });

export type Env = typeof env;
