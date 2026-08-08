/**
 * clean_brands.ts
 * Veritabanındaki marka isimlerini standartlaştırır ("Samsung s25 fe" -> "Samsung").
 */
import { prisma } from '../lib/prisma';

function normalizeBrand(b: string): string {
  const s = (b || '').toLowerCase().trim();
  if (s.startsWith('apple') || s.startsWith('iphone')) return 'Apple';
  if (s.startsWith('samsung')) return 'Samsung';
  if (s.includes('xiaomi') || s.includes('redmi')) return 'Xiaomi';
  if (s.includes('poco')) return 'Poco';
  if (s.includes('oppo')) return 'Oppo';
  if (s.includes('realme')) return 'Realme';
  if (s.includes('huawei')) return 'Huawei';
  if (s.includes('vivo')) return 'Vivo';
  if (s.includes('honor')) return 'Honor';
  if (s.includes('infinix')) return 'Infinix';
  if (s.includes('tecno')) return 'Tecno';
  if (s.includes('nothing')) return 'Nothing';
  if (s.includes('casper')) return 'Casper';
  if (s.includes('omix')) return 'Omix';
  return b.charAt(0).toUpperCase() + b.slice(1).toLowerCase();
}

async function main() {
  const products = await prisma.globalProduct.findMany();
  console.log(`Checking ${products.length} GlobalProduct records...`);

  let updated = 0;
  for (const p of products) {
    const norm = normalizeBrand(p.brand);
    if (norm !== p.brand) {
      await prisma.globalProduct.update({
        where: { id: p.id },
        data: { brand: norm },
      });
      console.log(`  Fix: "${p.brand}" -> "${norm}" (${p.model})`);
      updated++;
    }
  }

  console.log(`🎉 Done! Updated ${updated} brand names.`);
  await prisma.$disconnect();
}

main().catch(console.error);
