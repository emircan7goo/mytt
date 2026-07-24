/**
 * POST /api/auth/logout — Cookie'leri temizler, refresh token'ı DB'den siler.
 * (backend/src/auth/{auth.controller,auth.service}.ts → logout'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { REFRESH_COOKIE, verifyJwt, clearAuthCookies } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      const payload = verifyJwt<{ sub: string }>(refreshToken);
      if (payload?.sub) {
        await prisma.user.update({
          where: { id: payload.sub },
          data: { refreshTokenHash: null },
        }).catch(() => {});
      }
    } catch {
      // Token süresi dolmuşsa bile cookie'yi temizliyoruz, hata verme
    }
  }

  await clearAuthCookies();

  return NextResponse.json({ message: 'Çıkış yapıldı.' });
}
