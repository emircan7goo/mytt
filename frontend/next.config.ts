import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  // Docker production için standalone build
  output: process.env.DOCKER_BUILD === '1' ? 'standalone' : undefined,
  compress: true,
  reactStrictMode: true,
  serverExternalPackages: ['pg', '@prisma/adapter-pg', '@prisma/client'],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // ── Bütün Domainler Serbest (Çökmeleri Engellemek İçin) ───────────────
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },

      // ── Eski Özel CDN'ler (Wildcard eklendiği için aslında gerek yok ama kalabilir) ──
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'cdn.dummyjson.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'placehold.co' },

      // ── AWS S3 (Üretim Dosya Yükleme) ─────────────────────────────────────
      { protocol: 'https', hostname: '*.amazonaws.com' },

      // ── Cloudflare Images / R2 ─────────────────────────────────────────────
      { protocol: 'https', hostname: '*.cloudflare.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },

      // ── Cloudinary ────────────────────────────────────────────────────────
      { protocol: 'https', hostname: 'res.cloudinary.com' },

      // ── Supabase Storage ──────────────────────────────────────────────────
      { protocol: 'https', hostname: '*.supabase.co' },

      // ── Yerel Geliştirme (Docker / localhost upload api) ──────────────────
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'http',  hostname: '127.0.0.1' },

      // ── Marka Logoları (doğrudan kaynak) ──────────────────────────────────
      { protocol: 'https', hostname: 'www.apple.com' },
      { protocol: 'https', hostname: 'brand.samsung.com' },
    ],
  },
  turbopack: {},
  // ── Uploads Proxy: /uploads/* → backend (3001) ────────────────────────────
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${API_URL}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/banners/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/brands/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
