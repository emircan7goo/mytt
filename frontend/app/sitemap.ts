/**
 * app/sitemap.ts — Dynamic Sitemap Generator
 * Next.js otomatik olarak /sitemap.xml olarak serve eder.
 *
 * NOT: Build zamanında kendi API route'una fetch() ile istek atmak Vercel'de
 * çalışmaz — o anda site'ı sunacak sunucu henüz ayakta değildir (chicken-egg
 * problemi). Bunun yerine doğrudan Prisma ile sorgulanır.
 */
import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
const SITE_URL   = 'https://mytt.com.tr';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Statik sayfalar ──────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/login`,     changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`,  changeFrequency: 'monthly', priority: 0.3 },
  ];

  // ── Dinamik ürün sayfaları — gerçek katalog vitrini (marka+model aileleri) ──
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const variants = await prisma.globalProduct.findMany({
      where: { isActive: true, dealerItems: { some: { adminApproved: true, stock: { gt: 0 } } } },
      select: { brand: true, model: true, createdAt: true },
    });

    const families = new Map<string, { brand: string; model: string; createdAt: Date }>();
    for (const v of variants) {
      const key = `${v.brand}|||${v.model}`;
      const existing = families.get(key);
      if (!existing || v.createdAt > existing.createdAt) {
        families.set(key, v);
      }
    }

    productPages = Array.from(families.values()).map((f) => ({
      url:             `${SITE_URL}/urun/${encodeURIComponent(f.brand)}/${encodeURIComponent(f.model)}`,
      lastModified:    f.createdAt,
      changeFrequency: 'weekly' as const,
      priority:        0.8,
    }));
  } catch {
    // Veritabanına erişilemezse boş bırak — sitemap yine de static sayfalarla döner
  }

  return [...staticPages, ...productPages];
}
