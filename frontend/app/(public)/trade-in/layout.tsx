import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trade-In — Eski Telefonu Yenisiyle Değiştir | Mytt',
  description:
    'Eski telefonunuzun değerini öğrenin, yeni cihazınızı çok daha uygun fiyata alın. Anlık piyasa fiyatı, güvenli & hızlı takas işlemi. Mytt Trade-In.',
  keywords: [
    'trade-in', 'takas', 'telefon takas', 'iPhone takas', 'Samsung takas',
    'eski telefon değeri', 'yeni telefon al', 'Mytt takas', 'cihaz takas',
  ],
  alternates: { canonical: 'https://mytt.com.tr/trade-in' },
  openGraph: {
    title: 'Trade-In — Eski Telefonu Yenisiyle Değiştir | Mytt',
    description: 'Eski cihazınızı değerlendirin, yenisiyle takas edin. %40\'a kadar tasarruf.',
    url: 'https://mytt.com.tr/trade-in',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Mytt',
    images: [{ url: 'https://mytt.com.tr/og-banner.png', width: 1200, height: 630, alt: 'Mytt — Trade-In' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade-In — Eski Telefonu Yenisiyle Değiştir | Mytt',
    description: 'Eski cihazınızı değerlendirin, yenisiyle takas edin.',
    images: ['https://mytt.com.tr/og-banner.png'],
  },
};

export default function TradeInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
