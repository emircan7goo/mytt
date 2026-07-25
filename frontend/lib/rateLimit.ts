/**
 * lib/rateLimit.ts — Sabit pencere (fixed-window) rate limiting.
 *
 * Backend'deki NestJS ThrottlerModule'ün (register/login/OTP endpoint'lerinde
 * kullanılan) yerini alır. Next.js API route'ları serverless olduğu için
 * in-memory sayaç güvenilir değil — Postgres'teki RateLimitHit tablosunda
 * tutuluyor, tüm instance'lar arasında tutarlı çalışır.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

function getClientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * `maxAttempts` istek `windowMs` süresi içinde aşılırsa true döner (limit aşıldı).
 * `bucket` genelde route adı ("login", "register" gibi); IP otomatik eklenir.
 */
export async function isRateLimited(
  req: NextRequest,
  bucket: string,
  maxAttempts: number,
  windowMs: number,
): Promise<boolean> {
  const ip = getClientIp(req);
  const key = `${bucket}:${ip}`;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const hit = await prisma.rateLimitHit.upsert({
    where: { key_windowStart: { key, windowStart } },
    create: { key, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  // Fırsatçı temizlik — eski pencereleri seyrek olarak sil (yük oluşturmasın)
  if (Math.random() < 0.02) {
    void prisma.rateLimitHit.deleteMany({
      where: { windowStart: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
    }).catch(() => {});
  }

  return hit.count > maxAttempts;
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { message: 'Çok fazla deneme yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.' },
    { status: 429 },
  );
}
