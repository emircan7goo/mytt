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
    default: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    template: '%s | Mytt',
  },
  description: 'Sıfır ve hatasız 2. el telefonlarda doğrulanmış bayi teklifleri. iPhone, Samsung, Xiaomi — güvenli, garantili, uzman kontrollü.',
  keywords: ['ikinci el iPhone', 'sıfır telefon', 'Samsung Galaxy', 'Xiaomi', 'garantili telefon', 'doğrulanmış bayi', 'Mytt'],
  authors: [{ name: 'Mytt' }],
  creator: 'Mytt',
  publisher: 'Mytt',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'Mytt',
    title: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    description: 'Sıfır ve hatasız 2. el cihazlarda doğrulanmış bayi teklifleri — güvenli, garantili, uzman kontrollü.',
    images: [
      {
        url: `${BASE_URL}/og-banner.png`,
        width: 1200,
        height: 630,
        alt: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    description: 'Sıfır ve hatasız 2. el cihazlarda doğrulanmış bayi teklifleri — güvenli ve garantili.',
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

/**
 * Root Layout — SADECE <html> ve <body> açar.
 * Navbar / CartDrawer / AuthModal gibi vitrin bileşenleri
 * burada YOK — (public) route grubu kendi layout'unda tutuyor.
 * Dashboard route grupları ((admin), (dealer), (customer)) da
 * kendi AppProvider + Sidebar + Topbar'larını kendi layout.tsx'lerinde alıyor.
 */
// Schema.org Organization markup — site genelinde
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type':    'Organization',
  name:       'Mytt',
  url:        BASE_URL,
  logo:       `${BASE_URL}/logo.png`,
  sameAs:     [],
  contactPoint: {
    '@type':       'ContactPoint',
    contactType:   'customer service',
    availableLanguage: 'Turkish',
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
        {/* Global Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Suspense fallback={null}>
          <AppProvider>{children}</AppProvider>
        </Suspense>
      </body>
    </html>
  );
}
