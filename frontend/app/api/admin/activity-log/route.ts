/**
 * GET /api/admin/activity-log — [Admin] Son 200 sistem aktivite kaydı.
 * (backend/src/admin/admin.service.ts → getActivityLogs'tan taşındı)
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const gate = await requireRole(req, ['ADMIN']);
  if (gate.error) return gate.error;

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { admin: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(logs);
}
