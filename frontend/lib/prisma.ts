/**
 * lib/prisma.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Neon (serverless Postgres) için Prisma singleton.
 *
 * PrismaNeon (WebSocket/Pool tabanlı) kullanılıyor — PrismaNeonHttp DEĞİL,
 * çünkü backend'deki $transaction akışları (checkout, escrow release, sell-request
 * teklif kabul vb.) interactive transaction gerektiriyor; HTTP adaptörü bunu desteklemiyor.
 *
 * Vercel serverless fonksiyonlarında her invocation yeni bir modül context'i
 * alabilir; dev'de Next.js hot-reload de aynı şekilde modülü sıfırdan yükleyebilir.
 * globalThis üzerinde saklayarak gereksiz yeni bağlantı havuzu oluşmasını engelliyoruz.
 */
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL tanımlı değil — .env dosyasını kontrol edin.');
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Always cache the client globally in serverless lambdas to avoid reconnecting on every request!
globalForPrisma.prisma = prisma;
