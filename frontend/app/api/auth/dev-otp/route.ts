/**
 * GET /api/auth/dev-otp?email=... — SADECE development: OTP kodunu döndürür.
 * Production'da 404 verir (endpoint hiç yokmuş gibi).
 * (backend/src/auth/auth.service.ts → getDevOtp'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ message: 'email parametresi gerekli' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, emailVerifyToken: true, emailVerifyExpiry: true, emailVerified: true },
  });
  if (!user) {
    return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 400 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ email, code: null, expiresAt: null });
  }
  const code = user.emailVerifyToken ? user.emailVerifyToken.split('-').pop() ?? null : null;
  return NextResponse.json({ email, code, expiresAt: user.emailVerifyExpiry });
}
