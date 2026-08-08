/**
 * import_semih_stock.ts
 * Semih İletişim yedek dosyasındaki "stock" durumundaki 68 cihazı
 * GlobalProduct + DealerStock tablolarına aktarır.
 */
import { prisma } from '../lib/prisma';
import * as fs from 'fs';

function mapCondition(cond: string): 'NEW' | 'SECOND_HAND' {
  const c = (cond || '').toLowerCase();
  if (c.includes('sıfır') || c.includes('sifir')) return 'NEW';
  return 'SECOND_HAND';
}

function gradeFromCondition(cond: string): string {
  const c = (cond || '').toLowerCase();
  if (c.includes('sıfır') || c.includes('sifir')) return 'A+';
  if (c.includes('çok iyi') || c.includes('cok iyi')) return 'A';
  if (c.includes('iyi')) return 'B';
  return 'C';
}

function normalizeBrand(brand: string): string {
  const b = (brand || '').toLowerCase().trim();
  if (b === 'apple' || b.startsWith('iphone')) return 'Apple';
  if (b === 'samsung') return 'Samsung';
  if (b.includes('xiaomi') || b.includes('redmi') || b === 'red mi') return 'Xiaomi';
  if (b === 'oppo') return 'Oppo';
  if (b === 'huawei') return 'Huawei';
  if (b === 'vivo' || b === 'vivi') return 'Vivo';
  if (b === 'realme' || b === 'real me') return 'Realme';
  if (b === 'omix') return 'Omix';
  if (b === 'honor') return 'Honor';
  if (b.includes('infinix')) return 'Infinix';
  if (b.includes('tecno')) return 'Tecno';
  if (b.includes('nothins') || b.includes('nothing')) return 'Nothing';
  if (b.includes('casper')) return 'Casper';
  if (b === 'poco' || b === 'pocco') return 'Poco';
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}

function normalizeModel(model: string): string {
  let m = (model || '').trim();
  const words = m.split(' ');
  const half = Math.floor(words.length / 2);
  if (words.length >= 4 && words.slice(0, half).join(' ').toLowerCase() === words.slice(half).join(' ').toLowerCase()) {
    m = words.slice(0, half).join(' ');
  }
  m = m.replace(/^iphoe\s/i, 'iPhone ');
  m = m.replace(/^iphone\s/i, 'iPhone ');
  m = m.replace(/promax/gi, 'Pro Max');
  return m.charAt(0).toUpperCase() + m.slice(1);
}

function warrantyToMonths(w: string): number | null {
  if (!w || w === 'Yok' || w === '') return null;
  if (w.includes('1 Yıl') || w.includes('12')) return 12;
  if (w.includes('6')) return 6;
  if (w.includes('3')) return 3;
  if (w.includes('1 Ay') || w.includes('1 ay')) return 1;
  return null;
}

async function main() {
  const jsonPath = 'C:\\Users\\emirc\\Downloads\\semih_iletisim_auto_backup.json';
  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(raw);
  const devices: any[] = data.devices;

  const stockDevices = devices.filter((d: any) => d.status === 'stock');
  console.log(`\n📦 Semih İletişim: Stoktaki ${stockDevices.length} cihaz aktarılıyor...`);

  // Semih İletişim kullanıcısı ve mağazası
  let dealerUser = await prisma.user.findFirst({ where: { email: 'semih@mytt.com.tr' } });
  if (!dealerUser) {
    const bcrypt = require('bcryptjs');
    dealerUser = await prisma.user.create({
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
    console.log(`👤 User oluşturuldu: ${dealerUser.email}`);
  }

  let store = await prisma.store.findUnique({ where: { ownerId: dealerUser.id } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        ownerId: dealerUser.id,
        name: 'Semih İletişim',
        isPremium: true,
        subscriptionStatus: 'ACTIVE',
        bio: 'İstanbul\'un güvenilir 2. el telefon uzmanı. 1000+ tamamlanmış işlem.',
        rating: 4.9,
        reviewCount: 52,
        jobsCompleted: 1093,
      }
    });
    console.log(`🏪 Store oluşturuldu: ${store.name}`);
  }

  let inserted = 0;
  let skipped = 0;

  for (const d of stockDevices) {
    try {
      const brand = normalizeBrand(d.brand);
      const model = normalizeModel(d.model);
      const storage = d.storage ? `${d.storage}GB` : null;
      const color = d.color || null;
      const grade = gradeFromCondition(d.condition || '');
      const price = d.sellPrice || d.purchasePrice || 1000;
      const warrantyMonths = warrantyToMonths(d.warranty || '');

      // GlobalProduct (brand + model + storage + color)
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

      // DealerStock
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
          adminApproved: true, // Otomatik onaylı — anında pazaryerinde listelensin!
        }
      });

      console.log(`  ✅ [${d.id}] ${brand} ${model} ${storage || ''} ${color || ''} | ${price.toLocaleString('tr-TR')} TL`);
      inserted++;
    } catch (e: any) {
      console.error(`  ❌ [${d.id}] ${d.brand} ${d.model} HATA: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\n🎉 TAMAMLANDI! ${inserted} cihaz başarıyla veritabanına aktarıldı, ${skipped} hata.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('Hata:', e);
  process.exit(1);
});
