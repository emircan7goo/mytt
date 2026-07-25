/**
 * (public) Route Group Layout
 * Announcement Ticker → Navbar (main + category bar) → content
 */
import type { Metadata } from 'next';
import AnnouncementTicker from '@/components/AnnouncementTicker';

export const metadata: Metadata = {
  title: {
    default: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    template: '%s | Mytt',
  },
  description:
    'iPhone, Samsung, Xiaomi ve daha fazlası — sıfır ve hatasız 2. el cihazlarda doğrulanmış bayi teklifleri. Güvenli alışveriş, hızlı kargo.',
  keywords: [
    'ikinci el telefon', 'sıfır telefon', 'garantili iPhone', 'Samsung ikinci el',
    'Xiaomi ikinci el', 'telefon al', 'Mytt', 'güvenli alışveriş',
  ],
  alternates: { canonical: 'https://mytt.com.tr' },
  openGraph: {
    title: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    description: 'Sıfır ve hatasız 2. el cihazlarda doğrulanmış bayi teklifleri — güvenli ve garantili.',
    url: 'https://mytt.com.tr',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Mytt',
    images: [{ url: 'https://mytt.com.tr/og-banner.png', width: 1200, height: 630, alt: 'Mytt Galeri' }],
  },
};
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/auth/AuthModal';
import CartDrawer from '@/components/CartDrawer';
import ProductDetailModal from '@/components/ProductDetailModal';
import Footer from '@/components/Footer';
import GodLevelOverlay from '@/components/GodLevelOverlay';
import CookieConsent from '@/components/CookieConsent';
import BackToTop from '@/components/BackToTop';
import FlashDealBanner from '@/components/FlashDealBanner';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-x-hidden bg-[var(--bg)] text-[var(--ink-2)] min-h-screen">
      {/* Flash Deal Banner — controlled by topBannerActive in SiteConfig */}
      <FlashDealBanner />
      {/* Sticky top wrapper: Ticker + Navbar */}
      <div className="sticky top-0 z-[50]">
        <AnnouncementTicker />
        <Navbar />
      </div>
      <main className="w-full min-h-screen overflow-x-hidden">
        {children}
      </main>
      <Footer />
      <AuthModal />
      <CartDrawer />
      <ProductDetailModal />
      <GodLevelOverlay />
      {/* KVKK Çerez Onay Banner */}
      <CookieConsent />
      <BackToTop />
    </div>
  );
}
