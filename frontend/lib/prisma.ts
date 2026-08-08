/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Neon Postgres için Prisma client singleton (@prisma/adapter-pg + pg Pool).
 * Vercel serverless ortamında -pooler hostname sorunlarını otomatik çözer.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  let connectionString =
    process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_O53NHhMsuAfx@ep-quiet-dawn-asa5yj91.c-4.eu-central-1.aws.neon.tech/neondb?sslmode=require';

  // -pooler hostname Vercel serverless TCP bağlantılarında P1001/500 hatası verir; direct hostname'e dönüştür:
  if (connectionString.includes('-pooler.')) {
    connectionString = connectionString.replace('-pooler.', '.');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
