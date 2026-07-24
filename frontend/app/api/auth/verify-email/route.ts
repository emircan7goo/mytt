/**
 * GET /api/auth/verify-email?token=... — Eski link tabanlı doğrulama.
 * (backend/src/auth/auth.service.ts → verifyEmail'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) {
    return NextResponse.json({ message: "Doğrulama token'ı eksik." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { emailVerifyToken: token } });
  if (!user) {
    return NextResponse.json({ message: 'Geçersiz doğrulama bağlantısı.' }, { status: 400 });
  }
  if (!user.emailVerifyExpiry || user.emailVerifyExpiry < new Date()) {
    return NextResponse.json(
      { message: 'Doğrulama bağlantısının süresi dolmuş. Lütfen tekrar kayıt olun veya destek ile iletişime geçin.' },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  return NextResponse.json({ message: 'E-posta adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.' });
}
