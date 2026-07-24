/**
 * PATCH /api/users/me/password — Şifre değiştir (mevcut şifre doğrulaması ile).
 * (backend/src/user/user.service.ts → changePassword'dan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth-server';

export async function PATCH(req: NextRequest) {
  const authUser = await getAuthUser(req);
  if (!authUser) return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });

  const dto = await req.json().catch(() => null);
  const currentPassword = dto?.currentPassword;
  const newPassword = dto?.newPassword;

  if (typeof currentPassword !== 'string' || !currentPassword) {
    return NextResponse.json({ message: 'Mevcut şifre zorunludur.' }, { status: 400 });
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json({ message: 'Yeni şifre en az 6 karakter olmalıdır.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user || !user.password) return NextResponse.json({ message: 'Kullanıcı bulunamadı' }, { status: 400 });

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) return NextResponse.json({ message: 'Mevcut şifre hatalı' }, { status: 400 });

  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: authUser.id }, data: { password: hashed } });

  return NextResponse.json({ message: 'Şifreniz başarıyla güncellendi.' });
}
