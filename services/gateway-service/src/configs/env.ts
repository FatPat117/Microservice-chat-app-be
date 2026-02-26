import 'dotenv/config';

import { createEnv, z } from '@chatapp/common';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  GATEWAY_SERVICE_PORT: z
    .coerce.number()
    .int()
    .positive()
    .min(0)
    .max(65_535)
    .default(4000),
   AUTH_SERVICE_URL: z.string().url(),
   USER_SERVICE_URL: z.string().url(),
   INTERNAL_API_TOKEN: z.string().min(6),

});

export const env = createEnv(EnvSchema.shape, { serviceName: 'gateway-service' });

export type Env = typeof env;
