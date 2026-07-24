/**
 * PATCH /api/admin/dealer-applications/[id] — Bayi başvurusunu onayla/reddet.
 * (backend/src/admin/admin.service.ts → updateDealerApplicationStatus'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';
import { logActivity } from '@/lib/activityLog';
import { sendDealerApproved, sendDealerRejected } from '@/lib/mail';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const status = body?.status;
  if (status !== 'APPROVED' && status !== 'REJECTED') {
    return NextResponse.json({ message: 'Geçersiz durum.' }, { status: 400 });
  }

  const application = await prisma.dealerApplication.findUnique({ where: { id } });
  if (!application) return NextResponse.json({ message: 'Başvuru bulunamadı' }, { status: 404 });

  const newRole = status === 'APPROVED' ? 'DEALER' : 'CUSTOMER';

  const result = await prisma.$transaction(async (tx) => {
    const updatedApp = await tx.dealerApplication.update({ where: { id }, data: { status } });
    await tx.user.update({
      where: { id: application.userId },
      data: {
        role: newRole,
        b2bStatus: status,
        ...(status === 'APPROVED' && { commissionRate: 0.05 }),
      },
    });

    if (status === 'APPROVED') {
      const existing = await tx.store.findUnique({ where: { ownerId: application.userId } });
      if (!existing) {
        await tx.store.create({ data: { ownerId: application.userId, name: application.companyName } });
      }
    }

    return updatedApp;
  });

  const userInfo = await prisma.user.findUnique({ where: { id: application.userId }, select: { email: true, name: true } });
  if (userInfo) {
    if (status === 'APPROVED') {
      void sendDealerApproved({ email: userInfo.email, name: userInfo.name ?? userInfo.email, companyName: application.companyName });
    } else {
      void sendDealerRejected({ email: userInfo.email, name: userInfo.name ?? userInfo.email });
    }
  }

  await logActivity(gate.user.id, status === 'APPROVED' ? 'APPROVE_DEALER' : 'REJECT_DEALER', 'DealerApplication', id, {
    userId: application.userId, companyName: application.companyName, status,
  });

  return NextResponse.json(result);
}
