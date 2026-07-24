/**
 * GET /api/auth/me — Cookie'deki JWT ile oturum bilgisini döndürür.
 * (backend/src/auth/auth.controller.ts → me'den taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, displayName } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: displayName(user),
    role: user.role.toLowerCase(),
    commissionRate: user.commissionRate,
    b2bStatus: user.b2bStatus,
    walletBalance: Number(user.walletBalance ?? 0),
  });
}
