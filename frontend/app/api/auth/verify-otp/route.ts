/**
 * POST /api/auth/verify-otp — 6 haneli kod ile e-posta doğrulama.
 * (backend/src/auth/auth.service.ts → verifyOtp'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;
  const code = body?.code;

  if (typeof email !== 'string' || typeof code !== 'string' || !code) {
    return NextResponse.json({ message: 'E-posta ve kod zorunludur.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: 'Bu e-posta adresi bulunamadı.' }, { status: 400 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' });
  }
  if (!user.emailVerifyToken) {
    return NextResponse.json({ message: 'Doğrulama kodu bulunamadı. Lütfen yeni kod isteyin.' }, { status: 400 });
  }
  if (!user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
    return NextResponse.json({ message: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni kod isteyin.' }, { status: 400 });
  }

  const storedOtp = user.emailVerifyToken.split('-').pop();
  if (storedOtp !== code.trim()) {
    return NextResponse.json({ message: 'Doğrulama kodu hatalı. Lütfen tekrar deneyin.' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  return NextResponse.json({ message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' });
}
