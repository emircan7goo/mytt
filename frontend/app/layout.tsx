import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProvider } from "@/providers/AppProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

// Editoryal başlık fontu — model karşılaştırma/vitrin akışında premium his için
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
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
  themeColor: '#EA580C',
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
    <html lang="tr" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#EA580C" />
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
