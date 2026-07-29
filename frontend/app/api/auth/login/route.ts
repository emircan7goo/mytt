/**
 * POST /api/auth/login — HttpOnly JWT cookie set eder.
 * (backend/src/auth/{auth.controller,auth.service}.ts → login'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth-server';
import { isRateLimited, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  if (await isRateLimited(req, 'login', 5, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;

  if (typeof email !== 'string' || typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ message: 'E-posta veya şifre hatalı.' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true, email: true, password: true, role: true, name: true, isActive: true,
      commissionRate: true, b2bStatus: true, emailVerified: true, emailVerifyToken: true,
    },
  });

  if (!user || !user.password) {
    return NextResponse.json({ message: 'E-posta veya şifre hatalı.' }, { status: 401 });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ message: 'E-posta veya şifre hatalı.' }, { status: 401 });
  }

  // E-posta doğrulama artık giriş için ZORUNLU DEĞİL. Doğrulanmamış kullanıcı
  // da giriş yapabilir; site içinde opsiyonel bir "e-postanı doğrula" banner'ı
  // (components/EmailVerifyBanner.tsx) ile hatırlatılır. Böylece mail ulaşmasa
  // bile kimse hesabına kilitlenmez.
  const roleNormalized = user.role.toLowerCase() as 'customer' | 'dealer' | 'admin';
  const accessToken = signAccessToken({ email: user.email, sub: user.id, role: user.role });
  const refreshToken = signRefreshToken(user.id);

  const refreshHash = await bcrypt.hash(refreshToken, 8);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } });

  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name ?? user.email.split('@')[0],
      role: roleNormalized,
      commissionRate: user.commissionRate,
      b2bStatus: user.b2bStatus,
      emailVerified: user.emailVerified,
    },
  });
}
