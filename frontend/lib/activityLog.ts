/**
 * lib/activityLog.ts — Admin aksiyonlarının denetim kaydı
 * (backend/src/{admin,order}/*.service.ts'te tekrarlanan logActivity'den taşındı)
 * Asla ana işlemi bloklamaz — yazım hatası sadece loglanır.
 */
import { prisma } from './prisma';

export async function logActivity(
  adminId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  meta?: any,
): Promise<void> {
  try {
    await prisma.activityLog.create({ data: { adminId, action, entityType, entityId, meta } });
  } catch (err) {
    console.error(`ActivityLog yazılamadı: ${action}`, err);
  }
}
