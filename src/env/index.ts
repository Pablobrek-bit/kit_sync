import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  SECRET_KEY: z.string().default('secret'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error(_env.error);
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
