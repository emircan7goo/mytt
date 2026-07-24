/**
 * POST /api/auth/reset-password
 * (backend/src/auth/auth.service.ts → resetPassword'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.token;
  const newPassword = body?.newPassword;

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json({ message: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExpiry) {
    return NextResponse.json({ message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı' }, { status: 400 });
  }
  if (user.resetTokenExpiry < new Date()) {
    return NextResponse.json({ message: 'Sıfırlama bağlantısının süresi dolmuş. Lütfen tekrar isteyin.' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetToken: null, resetTokenExpiry: null },
  });

  return NextResponse.json({ message: 'Şifreniz başarıyla güncellendi.' });
}
