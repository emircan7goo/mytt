/**
 * POST /api/payout/request — [Bayi] Çekim talebi oluştur.
 * (backend/src/payout/payout.service.ts → requestPayout'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { getEarnings } from '@/lib/payout';

export async function POST(req: NextRequest) {
  const gate = await requireRole(req, ['DEALER']);
  if (gate.error) return gate.error;

  const body = await req.json().catch(() => null);
  const iban: string | undefined = body?.iban?.trim();
  const ibanName: string | undefined = body?.ibanName?.trim();
  const requestedAmount: number | undefined = body?.amount;

  if (!iban) return NextResponse.json({ message: 'IBAN girilmesi zorunludur.' }, { status: 400 });

  const { withdrawable } = await getEarnings(gate.user.id);
  if (withdrawable <= 0) {
    return NextResponse.json({ message: 'Çekilebilir bakiyeniz yok.' }, { status: 400 });
  }

  const amount = requestedAmount ?? withdrawable;
  if (amount <= 0 || amount > withdrawable + 0.01) {
    return NextResponse.json({ message: `Talep tutarı çekilebilir bakiyeyi (${withdrawable.toFixed(2)} ₺) aşamaz.` }, { status: 400 });
  }

  await prisma.user.update({ where: { id: gate.user.id }, data: { iban, ibanName: ibanName || undefined } });

  const payout = await prisma.payout.create({
    data: { dealerId: gate.user.id, amount, iban, ibanName, status: 'PENDING' },
  });

  return NextResponse.json(payout, { status: 201 });
}
