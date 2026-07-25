/**
 * POST /api/auth/resend-otp
 * (backend/src/auth/auth.service.ts → resendOtp'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationCode } from '@/lib/mail';
import { isRateLimited, rateLimitResponse } from '@/lib/rateLimit';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  if (await isRateLimited(req, 'resend-otp', 3, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.emailVerified) {
    const otp = generateOtp();
    const emailVerifyToken = `${user.id.slice(0, 8)}-${otp}`;
    const emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });

    await sendVerificationCode({ email, name: user.name ?? email.split('@')[0], code: otp });
  }

  return NextResponse.json({ message: 'Yeni doğrulama kodu gönderildi.' });
}
