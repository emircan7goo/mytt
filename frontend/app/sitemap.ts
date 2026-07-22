/**
 * app/sitemap.ts — Dynamic Sitemap Generator
 * Next.js otomatik olarak /sitemap.xml olarak serve eder.
 */
import type { MetadataRoute } from 'next';
import { API_BASE } from '@/lib/apiBase';
const SITE_URL   = 'https://mytt.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Statik sayfalar ──────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                changeFrequency: 'daily',   priority: 1.0 },
    { url: `${SITE_URL}/login`,     changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/register`,  changeFrequency: 'monthly', priority: 0.3 },
  ];

  // ── Dinamik ürün sayfaları ───────────────────────────────────────────────
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/products?limit=500`, {
      next: { revalidate: 3600 }, // Saatte bir yenile
    });
    if (res.ok) {
      const data = await res.json();
      const products: Array<{ id: string; updatedAt?: string }> = Array.isArray(data)
        ? data
        : (data.items ?? data.data ?? []);

      productPages = products.map((p) => ({
        url:             `${SITE_URL}/product/${p.id}`,
        lastModified:    p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority:        0.8,
      }));
    }
  } catch {
    // Build sırasında backend erişilemezse boş bırak
  }

  return [...staticPages, ...productPages];
}
