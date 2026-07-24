/**
 * POST /api/auth/refresh — Refresh token ile yeni access token al.
 * (backend/src/auth/{auth.controller,auth.service}.ts → refresh'ten taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  REFRESH_COOKIE, verifyJwt, signAccessToken, signRefreshToken, setAuthCookies,
} from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token bulunamadı' }, { status: 400 });
  }

  let userId: string;
  try {
    const payload = verifyJwt<{ sub: string }>(refreshToken);
    userId = payload.sub;
  } catch {
    return NextResponse.json({ message: 'Geçersiz veya süresi dolmuş refresh token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.refreshTokenHash) {
    return NextResponse.json({ message: 'Geçersiz oturum' }, { status: 401 });
  }
  const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!isValid) {
    return NextResponse.json({ message: 'Geçersiz refresh token' }, { status: 401 });
  }

  const newAccessToken = signAccessToken({ email: user.email, sub: user.id, role: user.role });
  const newRefreshToken = signRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: await bcrypt.hash(newRefreshToken, 8) },
  });

  await setAuthCookies(newAccessToken, newRefreshToken);

  return NextResponse.json({ ok: true });
}
