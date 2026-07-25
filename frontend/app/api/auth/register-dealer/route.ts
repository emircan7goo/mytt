/**
 * POST /api/auth/register-dealer
 * (backend/src/auth/auth.service.ts → registerDealer'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { isRateLimited, rateLimitResponse } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  if (await isRateLimited(req, 'register-dealer', 5, 60_000)) return rateLimitResponse();

  const body = await req.json().catch(() => null);
  const { email, name, password, companyName, taxId } = body ?? {};

  if (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ message: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
  }
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ message: 'Ad soyad zorunludur.' }, { status: 400 });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return NextResponse.json({ message: 'Şifre en az 6 karakter olmalıdır.' }, { status: 400 });
  }
  if (typeof companyName !== 'string' || !companyName.trim()) {
    return NextResponse.json({ message: 'Şirket adı zorunludur.' }, { status: 400 });
  }
  if (typeof taxId !== 'string' || taxId.length < 10 || !/^[0-9]+$/.test(taxId)) {
    return NextResponse.json({ message: 'Vergi numarası en az 10 haneli ve sadece rakamlardan oluşmalıdır.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: 'Bu e-posta adresi ile zaten bir hesap var' }, { status: 409 });
  }

  const [existingTax, existingTaxApp] = await Promise.all([
    prisma.user.findFirst({ where: { taxId } }),
    prisma.dealerApplication.findFirst({ where: { taxNumber: taxId } }),
  ]);
  if (existingTax || existingTaxApp) {
    return NextResponse.json({ message: 'Bu vergi numarası sistemde kayıtlı' }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'CUSTOMER',
      b2bStatus: 'PENDING',
      companyName,
      taxId,
      dealerApplication: {
        create: { companyName, taxNumber: taxId, status: 'PENDING' },
      },
    },
  });

  const { password: _pw, ...safeUser } = user;
  return NextResponse.json(safeUser, { status: 201 });
}
