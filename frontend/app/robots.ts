/**
 * app/robots.ts — robots.txt Generator
 * Next.js otomatik olarak /robots.txt olarak serve eder.
 */
import type { MetadataRoute } from 'next';

const SITE_URL = 'https://mytt.com.tr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/admin/',
          '/bayi/',
          '/hesabim/',
          '/checkout/',
          '/payment/',
          '/api/',
          '/_next/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host:    SITE_URL,
  };
}
