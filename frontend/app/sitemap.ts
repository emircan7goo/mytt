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
  const now = new Date();

  // ── 1. Tüm Kurumsal & Servis Landing Sayfaları ───────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                       lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/trade-in`,         lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/sell`,             lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/garanti`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/guvenli-odeme`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/magazalar`,        lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${SITE_URL}/grading`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/sss`,              lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/ai-finder`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/compare`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/hakkimizda`,       lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/iletisim`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/login`,            lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/register`,         lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/register-dealer`,  lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/cerez-politikasi`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/gizlilik`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/kvkk`,            lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/kullanim-kosullari`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/sozlesmeler`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/basin`,            lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/kariyer`,          lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/yatirimcilar`,     lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];

  // ── 2. Katalogdaki tüm marka ve model aileleri ────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const variants = await prisma.globalProduct.findMany({
      where: { isActive: true },
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
      changeFrequency: 'daily' as const,
      priority:        0.9,
    }));
  } catch {
    // DB offline ise static landing sayfaları döner
  }

  return [...staticPages, ...productPages];
}
