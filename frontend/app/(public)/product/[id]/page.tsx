/**
 * app/(public)/product/[id]/page.tsx — Server Component
 *
 * generateMetadata ile ürün bilgilerini SSR olarak çeker,
 * OG ve Schema.org Product markup'ı ekler.
 * Asıl UI ise ProductDetailClient (client component) tarafından render edilir.
 */
import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { API_BASE } from '@/lib/apiBase';

// ── Ürün fetch helper (sadece server-side) ────────────────────────────────────
// DealerStock katalog endpoint'i kullanıyoruz — ürün ID'leri DealerStock ID'sidir
async function fetchProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/catalog/stock/public/${id}`, {
      next: { revalidate: 60 }, // 60 saniyede bir yenile (ISR)
    });
    if (!res.ok) return null;
    const raw = await res.json();
    // DealerStock yanıtını metadata için düzleştir
    const gp = raw.globalProduct ?? {};
    const dealerImgs: string[] = Array.isArray(raw.dealerImages)  ? raw.dealerImages  : [];
    const masterImgs: string[] = Array.isArray(gp.masterImages)   ? gp.masterImages   : [];
    const images = dealerImgs.length > 0 ? dealerImgs : masterImgs;
    return {
      id:        raw.id,
      brand:     gp.brand  ?? '',
      model:     gp.model  ?? '',
      condition: raw.condition ?? 'SECOND_HAND',
      price:     raw.price ?? 0,
      stock:     raw.stock ?? 0,
      imagesUrl: images,
    };
  } catch {
    return null;
  }
}

// ── Dynamic Metadata ──────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const product = await fetchProduct(id);

  if (!product) {
    return { title: 'Ürün Bulunamadı | Mytt' };
  }

  const title       = `${product.brand} ${product.model} — ${product.condition === 'NEW' ? 'Sıfır' : 'Yenilenmiş'} | Mytt`;
  const description = `${product.brand} ${product.model} — ₺${Number(product.price).toLocaleString('tr-TR')} — Güvenli alışveriş, garantili cihaz. Mytt Elite Galeri.`;
  const image       = product.imagesUrl?.[0] ?? '/og-banner.png';
  const url         = `https://mytt.com/product/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type:      'website',
      locale:    'tr_TR',
      siteName:  'Mytt',
      images: [{ url: image.startsWith('http') ? image : `${API_BASE}${image}`, width: 800, height: 800, alt: title }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
      images:      [image.startsWith('http') ? image : `${API_BASE}${image}`],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ProductDetailPage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  // Not: Ürün bulunamazsa 404 göstermek yerine client component'e bırakıyoruz.
  // ProductDetailClient kendi useProductById hook'u ile veriyi tekrar çeker ve hata durumunu yönetir.
  const product = await fetchProduct(id);

  // Schema.org Product JSON-LD — product null ise atla
  const jsonLd = product ? {
    '@context':       'https://schema.org',
    '@type':          'Product',
    name:             `${product.brand} ${product.model}`,
    description:      `${product.brand} ${product.model} — ${product.condition === 'NEW' ? 'Sıfır' : 'Yenilenmiş'} cihaz`,
    image:            product.imagesUrl ?? [],
    brand:            { '@type': 'Brand', name: product.brand },
    offers: {
      '@type':        'Offer',
      priceCurrency:  'TRY',
      price:          String(product.price),
      availability:   product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller:         { '@type': 'Organization', name: 'Mytt' },
      url:            `https://mytt.com/product/${id}`,
    },
    ...(product.condition === 'SECOND_HAND' && {
      itemCondition: 'https://schema.org/RefurbishedCondition',
    }),
  } : null;

  return (
    <>
      {/* Schema.org JSON-LD */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {/* Client UI */}
      <ProductDetailClient />
    </>
  );
}
