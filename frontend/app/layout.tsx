import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// IZGARA tipografisi — modern, geometrik, okunaklı tek sans ailesi.
// Başlıklarda kalın ağırlık + sıkı harf aralığı ile güçlü duruş (bkz. .k-display).
// latin-ext altkümesi Türkçe karakterler (ğ ş İ ı) için zorunlu.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Yalnız mikro teknik okumalar (pil %, teklif sayısı, sipariş no).
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const BASE_URL = 'https://mytt.com.tr';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Mytt — Sıfır & Hatasız 2. El Telefon Al Sat | 12 Ay Garantili',
    template: '%s | Mytt Telefon Pazaryeri',
  },
  description: 'Sıfır ve hatasız 2. el telefonlarda 150+ onaylı yetkili bayi teklifleri. iPhone, Samsung, Xiaomi — 12 ay garantili, %100 BDDK lisanslı Escrow güvencesi ile anında al sat.',
  keywords: [
    'mytt',
    'mytt telefon',
    'ikinci el telefon',
    'ikinci el telefon fiyatları',
    'sıfır ve hatasız ikinci el telefon',
    'ikinci el iphone',
    'ikinci el samsung galaxy',
    'garantili ikinci el telefon',
    'eskiyi getir yeniyi al',
    '2 el telefon al sat',
    'güvenli telefon ticareti',
    'doğrulanmış yetkili bayi teklifleri',
  ],
  authors: [{ name: 'Mytt Teknolojik Ürünler Pazaryeri' }],
  creator: 'Mytt',
  publisher: 'Mytt',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'Mytt',
    title: 'Mytt — Sıfır & Hatasız 2. El Telefon Al Sat | 12 Ay Garantili',
    description: '150+ Yetkili Bayiden Kapalı İhale Teklifleri. Sıfır ve Hatasız 2. El Akıllı Telefon Pazaryeri.',
    images: [
      {
        url: `${BASE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: 'Mytt — Sıfır & Hatasız 2. El Telefon Pazaryeri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mytt — Sıfır & Hatasız 2. El Telefon Al Sat',
    description: 'Sıfır ve hatasız 2. el cihazlarda 150+ yetkili bayi kapalı teklifleri — %100 BDDK Escrow Güvenceli.',
    images: [`${BASE_URL}/og-banner.png`],
    creator: '@mytt',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: BASE_URL,
  },
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#100D0B',
};

// Schema.org Organization markup — Google Knowledge Graph
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mytt',
  alternateName: ['Mytt Telefon', 'Mytt Pazaryeri'],
  url: BASE_URL,
  logo: `${BASE_URL}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Turkish',
  },
};

// Schema.org WebSite markup — Google Sitelinks Searchbox
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mytt',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?query={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" data-theme="dark" className={`${jakarta.variable} ${jetbrains.variable} h-full antialiased`}>
      <head>
        {/* Tema pre-paint: kayitli tercihi (yoksa varsayilan 'dark') boyamadan
            once uygular — FOUC (yanlis tema flashi) olmaz. ThemeContext ile ayni
            'mytt_theme' anahtarini kullanir. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mytt_theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#100D0B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Mytt" />
      </head>
      <body className="h-full font-sans overflow-x-hidden w-full">
        {/* Google Analytics 4 — Consent Mode v2 */}
        <GoogleAnalytics />
        {/* Global Schema.org (Organization & WebSite Sitelinks Searchbox) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Suspense fallback={null}>
          <AppProvider>{children}</AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
