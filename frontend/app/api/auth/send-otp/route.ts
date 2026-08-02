/**
 * POST /api/auth/send-otp — Gmail SMTP üzerinden 6 haneli OTP onay kodu gönderme
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationCode } from '@/lib/mail';
import { isRateLimited, rateLimitResponse } from '@/lib/rateLimit';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  if (await isRateLimited(req, 'send-otp', 5, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const email = body?.email;

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }

  // 6 haneli rastgele onay kodu üretimi
  const otp = generateOtp();
  const emailVerifyExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 DAKİKA ZAMAN AŞIMI

  // E-posta veritabanında kayıtlı kullanıcıya mı ait kontrolü
  let user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const emailVerifyToken = `${user.id.slice(0, 8)}-${otp}`;
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken, emailVerifyExpiry },
    });
  } else {
    // Geçici OTP saklama (Henüz üye olmamış e-postalar için de doğrulama)
    const tempToken = `GUEST-${otp}`;
    await prisma.user.create({
      data: {
        email,
        password: '',
        role: 'CUSTOMER',
        name: email.split('@')[0],
        emailVerified: false,
        emailVerifyToken: tempToken,
        emailVerifyExpiry,
      },
    });
  }

  // Gmail SMTP ile 6 Haneli OTP Gönderimi
  try {
    await sendVerificationCode({
      email,
      name: user?.name ?? email.split('@')[0],
      code: otp,
    });
  } catch (err: any) {
    console.error('SMTP Mail Gönderme Hatası:', err);
    return NextResponse.json(
      { message: 'E-posta gönderimi başarısız oldu. Lütfen tekrar deneyin.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: '6 haneli doğrulama kodunuz e-posta adresinize (Gmail SMTP) gönderilmiştir. (Geçerlilik süresi: 5 dakika)',
    expiresInSeconds: 300,
  });
}
