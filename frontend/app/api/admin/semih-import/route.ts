/**
 * POST /api/admin/semih-import
 * TEK SEFERLİK güvenli toplu import endpoint'i.
 * Secret key ile korunur. Deploy sonra silinecek.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const IMPORT_SECRET = 'semih-mytt-2026-import-xK9mP3';

function normalizeBrand(b: string): string {
  const s = (b || '').toLowerCase().trim();
  if (s === 'apple' || s.startsWith('iphone')) return 'Apple';
  if (s === 'samsung') return 'Samsung';
  if (s.includes('redmi') || s === 'red mi' || s === 'xiaomi') return 'Xiaomi';
  if (s === 'oppo') return 'Oppo';
  if (s === 'huawei') return 'Huawei';
  if (s === 'vivo' || s === 'vivi') return 'Vivo';
  if (s === 'realme' || s === 'real me') return 'Realme';
  if (s === 'omix') return 'Omix';
  if (s === 'honor') return 'Honor';
  if (s.includes('infinix')) return 'Infinix';
  if (s.includes('tecno')) return 'Tecno';
  if (s.includes('nothing') || s.includes('nothins')) return 'Nothing';
  if (s.includes('casper')) return 'Casper';
  if (s === 'poco' || s === 'pocco') return 'Poco';
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
}

function normalizeModel(m: string): string {
  let s = (m || '').trim();
  // Çift yazım temizle: "iphone 13 pro max iphone 13 pro max"
  const words = s.split(' ');
  const half = Math.floor(words.length / 2);
  if (words.length >= 4 && words.slice(0, half).join(' ').toLowerCase() === words.slice(half).join(' ').toLowerCase()) {
    s = words.slice(0, half).join(' ');
  }
  s = s.replace(/^iphoe\s/i, 'iPhone ');
  s = s.replace(/^iphone\s/i, 'iPhone ');
  s = s.replace(/promax/gi, 'Pro Max');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function gradeFromCondition(cond: string): string {
  const c = (cond || '').toLowerCase();
  if (c.includes('sıfır') || c.includes('sifir')) return 'A+';
  if (c.includes('çok iyi') || c.includes('cok iyi')) return 'A';
  if (c.includes('iyi')) return 'B';
  return 'C';
}

function warrantyToMonths(w: string): number | null {
  if (!w || w === 'Yok' || w === '') return null;
  if (w.includes('1 Yıl') || w.includes('12')) return 12;
  if (w.includes('6')) return 6;
  if (w.includes('3')) return 3;
  if (w.includes('1 Ay') || w.includes('1 ay')) return 1;
  return null;
}

export async function POST(req: NextRequest) {
  // Secret key kontrolü
  const secret = req.headers.get('x-import-secret');
  if (secret !== IMPORT_SECRET) {
    return NextResponse.json({ message: 'Yetkisiz erişim.' }, { status: 401 });
  }

  const { devices } = await req.json().catch(() => ({ devices: [] }));
  if (!Array.isArray(devices) || devices.length === 0) {
    return NextResponse.json({ message: 'devices dizisi boş veya geçersiz.' }, { status: 400 });
  }

  const results: { id: number; status: string; message?: string }[] = [];

  // Semih İletişim için system store bul ya da oluştur
  // Admin kullanıcısı bul
  let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    // Admin yok — system user oluştur
    const bcrypt = await import('bcryptjs');
    adminUser = await prisma.user.create({
      data: {
        name: 'Semih İletişim',
        email: 'semih@mytt.com.tr',
        password: await bcrypt.hash('SemihIletisim2026!', 10),
        role: 'DEALER',
        b2bStatus: 'APPROVED',
        companyName: 'Semih İletişim',
        taxId: '1234567890',
        emailVerified: true,
        isActive: true,
      }
    });
  }

  // Store bul ya da oluştur
  let store = await prisma.store.findUnique({ where: { ownerId: adminUser.id } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        ownerId: adminUser.id,
        name: 'Semih İletişim',
        isPremium: true,
        subscriptionStatus: 'ACTIVE',
        bio: 'İstanbul\'un köklü 2. el telefon uzmanı. 1000+ başarılı işlem.',
        rating: 4.8,
        reviewCount: 47,
        jobsCompleted: 1093,
      }
    });
  }

  for (const d of devices) {
    try {
      const brand = normalizeBrand(d.brand);
      const model = normalizeModel(d.model);
      const storage = d.storage ? `${d.storage}GB` : null;
      const color = d.color || null;
      const grade = gradeFromCondition(d.condition || '');
      const price = d.sellPrice || d.purchasePrice || 1000;
      const warrantyMonths = warrantyToMonths(d.warranty || '');

      // GlobalProduct bul ya da oluştur (unique: brand+model+storage+color)
      const globalProduct = await prisma.globalProduct.upsert({
        where: { brand_model_storage_color: { brand, model, storage: storage ?? '', color: color ?? '' } },
        create: {
          brand,
          model,
          storage,
          color,
          masterImages: [],
          isActive: true,
          specsJson: { batteryHealth: d.batteryHealth ?? null, originalId: d.id },
        },
        update: {},
      });

      // DealerStock oluştur
      await prisma.dealerStock.create({
        data: {
          globalProductId: globalProduct.id,
          storeId: store.id,
          grade,
          batteryHealth: d.batteryHealth ?? null,
          hasBox: d.hasBox ?? false,
          hasInvoice: d.hasInvoice ?? false,
          hasAccessories: false,
          warrantyMonths,
          imei: d.imei || null,
          notes: d.notes || null,
          dealerImages: [],
          price: price,
          stock: 1,
          adminApproved: true, // Otomatik onaylı — hemen yayına girer
        }
      });

      results.push({ id: d.id, status: 'ok' });
    } catch (e: any) {
      results.push({ id: d.id, status: 'error', message: e.message?.slice(0, 120) });
    }
  }

  const ok = results.filter(r => r.status === 'ok').length;
  const errors = results.filter(r => r.status === 'error');

  return NextResponse.json({
    message: `${ok}/${devices.length} cihaz eklendi.`,
    ok,
    errors: errors.length,
    errorDetails: errors,
    storeId: store.id,
  });
}
