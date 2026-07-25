import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cihazını Sat — En Yüksek Teklifi Al | Mytt',
  description:
    'Yüzlerce yetkili bayi cihazın için kapalı teklifte yarışır. 30 dakika içinde en yüksek teklifi al, kargola, paranı güvenle al. Ücretsiz & garanti.',
  keywords: [
    'cihaz sat', 'telefon sat', 'ikinci el telefon sat', 'iPhone sat', 'Samsung sat',
    'kapalı teklif', 'en yüksek fiyat', 'Mytt', 'güvenli satış',
  ],
  alternates: { canonical: 'https://mytt.com.tr/sell' },
  openGraph: {
    title: 'Cihazını Sat — En Yüksek Teklifi Al | Mytt',
    description: '30 dakikada yüzlerce bayi teklif yarışmasına katılıyor. En yüksek teklifi kabul et, anında öde al.',
    url: 'https://mytt.com.tr/sell',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Mytt',
    images: [{ url: 'https://mytt.com.tr/og-banner.png', width: 1200, height: 630, alt: 'Mytt — Cihazını Sat' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cihazını Sat — En Yüksek Teklifi Al | Mytt',
    description: '30 dakikada yüzlerce bayi teklif yarışmasına katılıyor.',
    images: ['https://mytt.com.tr/og-banner.png'],
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
