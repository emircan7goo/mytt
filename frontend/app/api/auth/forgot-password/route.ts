/**
 * POST /api/auth/forgot-password
 * (backend/src/auth/auth.service.ts → forgotPassword'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordReset } from '@/lib/mail';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Kullanıcı yoksa da hata verme — enumeration saldırısını önle
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/sifre-sifirla?token=${token}`;

    await sendPasswordReset({ email, name: user.name ?? email.split('@')[0], resetUrl });
  }

  return NextResponse.json({ message: 'Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.' });
}
