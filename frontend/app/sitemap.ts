/**
 * app/sitemap.ts — Dynamic Sitemap Generator
 * Next.js otomatik olarak /sitemap.xml olarak serve eder.
 */
import type { MetadataRoute } from 'next';
import { API_BASE } from '@/lib/apiBase';
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
    const res = await fetch(`${API_BASE}/catalog/browse?limit=1000`, {
      next: { revalidate: 3600 }, // Saatte bir yenile
    });
    if (res.ok) {
      const data = await res.json();
      const families: Array<{ brand: string; model: string; createdAt?: string }> = data.items ?? [];

      productPages = families.map((f) => ({
        url:             `${SITE_URL}/urun/${encodeURIComponent(f.brand)}/${encodeURIComponent(f.model)}`,
        lastModified:    f.createdAt ? new Date(f.createdAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority:        0.8,
      }));
    }
  } catch {
    // Build sırasında API'ye erişilemezse boş bırak
  }

  return [...staticPages, ...productPages];
}
