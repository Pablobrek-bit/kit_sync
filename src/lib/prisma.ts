import { PrismaClient } from '@prisma/client';
import { env } from '../env';

const databaseUrl =
  env.NODE_ENV === 'test' ? env.DATABASE_URL_TEST : env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});
