/**
 * POST /api/auth/register
 * (backend/src/auth/auth.service.ts → register'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendVerificationCode } from '@/lib/mail';
import { isRateLimited, rateLimitResponse } from '@/lib/rateLimit';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth-server';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  if (await isRateLimited(req, 'register', 10, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const email = body?.email;
  const password = body?.password;
  const name: string | undefined = body?.name;
  const role: string | undefined = body?.role;

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ message: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
  }
  if (role !== undefined && role !== 'CUSTOMER' && role !== 'DEALER') {
    return NextResponse.json({ message: 'Geçersiz rol.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: 'Bu e-posta adresi zaten kullanımda.' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: role === 'DEALER' ? 'DEALER' : 'CUSTOMER',
      name: name ?? null,
      emailVerified: false,
    },
  });

  const otp = generateOtp();
  const emailVerifyToken = `${user.id.slice(0, 8)}-${otp}`;
  const emailVerifyExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerifyToken, emailVerifyExpiry },
  });

  // OTP maili best-effort gönderilir (opsiyonel doğrulama için) — akışı bloklamaz.
  await sendVerificationCode({ email, name: name ?? email.split('@')[0], code: otp });

  // Kullanıcıyı kayıt anında doğrudan içeri al: doğrulama artık zorunlu değil.
  // login/route.ts ile aynı token + cookie akışı.
  const roleNormalized = user.role.toLowerCase() as 'customer' | 'dealer' | 'admin';
  const accessToken = signAccessToken({ email: user.email, sub: user.id, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const refreshHash = await bcrypt.hash(refreshToken, 8);
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } });
  await setAuthCookies(accessToken, refreshToken);

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? user.email.split('@')[0],
        role: roleNormalized,
        commissionRate: user.commissionRate,
        b2bStatus: user.b2bStatus,
        emailVerified: false,
      },
      message: 'Kayıt başarılı! E-posta adresinize 6 haneli doğrulama kodu gönderdik (isteğe bağlı).',
    },
    { status: 201 },
  );
}
