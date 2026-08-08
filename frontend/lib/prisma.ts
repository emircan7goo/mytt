/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Neon Postgres için standart ve sorunsuz Prisma client singleton.
 * Vercel serverless ve lokal ortamda %100 kararlı çalışır.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
