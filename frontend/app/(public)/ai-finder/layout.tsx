import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Telefon Bulucu — Sana Özel 3 Öneri | Mytt',
  description:
    'Bütçenizi ve kullanım alışkanlıklarınızı analiz edip saniyeler içinde kişisel en iyi 3 cihazı öneririz. Yapay zeka destekli, ücretsiz.',
  keywords: [
    'AI telefon bulucu', 'yapay zeka telefon öner', 'telefon önerisi', 'hangi telefon alsam',
    'bütçeye göre telefon', 'Mytt AI', 'akıllı telefon seçimi',
  ],
  alternates: { canonical: 'https://mytt.com/ai-finder' },
  openGraph: {
    title: 'AI Telefon Bulucu — Sana Özel 3 Öneri | Mytt',
    description: 'Bütçen ve ihtiyacına göre saniyeler içinde en iyi 3 cihaz önerisi.',
    url: 'https://mytt.com/ai-finder',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Mytt',
    images: [{ url: 'https://mytt.com/og-banner.png', width: 1200, height: 630, alt: 'Mytt — AI Telefon Bulucu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Telefon Bulucu — Sana Özel 3 Öneri | Mytt',
    description: 'Bütçen ve ihtiyacına göre saniyeler içinde en iyi 3 cihaz önerisi.',
    images: ['https://mytt.com/og-banner.png'],
  },
};

export default function AiFinderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
