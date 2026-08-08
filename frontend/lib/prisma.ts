/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Neon (serverless Postgres) için Prisma singleton.
 *
 * Vercel serverless ortamında güvenli ve yüksek performanslı bağlantı.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('DATABASE_URL is not set!');
  }

  try {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const ws = require('ws');
    neonConfig.webSocketConstructor = ws;

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  } catch (err) {
    console.warn('PrismaNeon adapter fallback to standard PrismaClient:', err);
    return new PrismaClient();
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  globalForPrisma.prisma = prisma;
}
