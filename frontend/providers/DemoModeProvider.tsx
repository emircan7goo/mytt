'use client';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Demo Mode Context — Sunum / Canlı mod geçişi
// Admin panelinden tek tuşla demo moduna geçiş sağlar.
// Demo modda sahte zengin veriler gösterilir.
// ─────────────────────────────────────────────────────────────────────────────

interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  setDemoMode: (v: boolean) => void;
}

const DemoModeContext = createContext<DemoModeContextType>({
  isDemoMode: false,
  toggleDemoMode: () => {},
  setDemoMode: () => {},
});

const STORAGE_KEY = 'mytt-demo-mode';

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [isDemoMode, setIsDemoMode] = useState(false);

  // localStorage'dan oku
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') setIsDemoMode(true);
    } catch {
      // SSR veya hata durumu
    }
  }, []);

  const setDemoMode = useCallback((v: boolean) => {
    setIsDemoMode(v);
    try { localStorage.setItem(STORAGE_KEY, String(v)); } catch {}
  }, []);

  const toggleDemoMode = useCallback(() => {
    setDemoMode(!isDemoMode);
  }, [isDemoMode, setDemoMode]);

  return (
    <DemoModeContext.Provider value={{ isDemoMode, toggleDemoMode, setDemoMode }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  return useContext(DemoModeContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO MOCK DATA — Sunum modunda gösterilecek zengin veri setleri
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_PRODUCTS = [
  {
    id: 'demo-1',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    condition: 'NEW' as const,
    price: 62999,
    originalPrice: 79999,
    stock: 5,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=400&hei=400&fmt=jpeg',
    images: [],
    imagesUrl: [],
    color: 'Natural Titanium',
    storage: '256GB',
    cosmeticGrade: 'A+' as const,
    batteryHealth: 100,
    inStock: true,
    stockCount: 5,
    isHot: true,
    isSponsored: false,
    priority: 10,
    isOnCampaign: true,
    discountedPrice: 62999,
    campaignTag: 'Premium',
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'A+', batteryHealth: 100 },
    warrantyMonths: 12,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Orijinal' as const, battery: 100, camera: 'Mükemmel' as const,
      speakers: 'Mükemmel' as const, faceId: true, touchId: false,
      wifi: true, cellular: true, charging: 'Hızlı Şarj' as const, testedAt: '2026-04-20',
    },
    createdAt: '2026-04-20T10:00:00Z',
    updatedAt: '2026-04-20T10:00:00Z',
    grade: 'A+',
    dealerCount: 3,
  },
  {
    id: 'demo-2',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    condition: 'SECOND_HAND' as const,
    price: 38999,
    originalPrice: 52999,
    stock: 8,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-1inch-deeppurple?wid=400&hei=400&fmt=jpeg',
    images: [],
    imagesUrl: [],
    color: 'Deep Purple',
    storage: '128GB',
    cosmeticGrade: 'A' as const,
    batteryHealth: 92,
    inStock: true,
    stockCount: 8,
    isHot: true,
    isSponsored: false,
    priority: 9,
    isOnCampaign: false,
    discountedPrice: null,
    campaignTag: null,
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'A', batteryHealth: 92 },
    warrantyMonths: 6,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Orijinal' as const, battery: 92, camera: 'Mükemmel' as const,
      speakers: 'İyi' as const, faceId: true, touchId: false,
      wifi: true, cellular: true, charging: 'Hızlı Şarj' as const, testedAt: '2026-04-18',
    },
    createdAt: '2026-04-18T10:00:00Z',
    updatedAt: '2026-04-18T10:00:00Z',
    grade: 'A',
    dealerCount: 5,
  },
  {
    id: 'demo-3',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    condition: 'NEW' as const,
    price: 54999,
    originalPrice: 69999,
    stock: 3,
    image: 'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s928-sm-s928bztqtur-539572455?$400_400_PNG$',
    images: [],
    imagesUrl: [],
    color: 'Titanium Black',
    storage: '256GB',
    cosmeticGrade: 'A+' as const,
    batteryHealth: 100,
    inStock: true,
    stockCount: 3,
    isHot: true,
    isSponsored: true,
    priority: 8,
    isOnCampaign: true,
    discountedPrice: 54999,
    campaignTag: 'Son Şans',
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'A+', batteryHealth: 100 },
    warrantyMonths: 12,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Kusursuz' as const, battery: 100, camera: 'Mükemmel' as const,
      speakers: 'Mükemmel' as const, faceId: false, touchId: true,
      wifi: true, cellular: true, charging: 'Hızlı Şarj' as const, testedAt: '2026-04-19',
    },
    createdAt: '2026-04-19T10:00:00Z',
    updatedAt: '2026-04-19T10:00:00Z',
    grade: 'A+',
    dealerCount: 2,
  },
  {
    id: 'demo-4',
    brand: 'Samsung',
    model: 'Galaxy S23',
    condition: 'SECOND_HAND' as const,
    price: 24999,
    originalPrice: 34999,
    stock: 12,
    image: 'https://images.samsung.com/is/image/samsung/p6pim/tr/sm-s911bzkdtur/gallery/tr-galaxy-s23-s911-sm-s911bzkdtur-thumb-534862580?$400_400_PNG$',
    images: [],
    imagesUrl: [],
    color: 'Phantom Black',
    storage: '128GB',
    cosmeticGrade: 'A' as const,
    batteryHealth: 88,
    inStock: true,
    stockCount: 12,
    isHot: false,
    isSponsored: false,
    priority: 7,
    isOnCampaign: false,
    discountedPrice: null,
    campaignTag: null,
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'A', batteryHealth: 88 },
    warrantyMonths: 6,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Orijinal' as const, battery: 88, camera: 'İyi' as const,
      speakers: 'İyi' as const, faceId: false, touchId: true,
      wifi: true, cellular: true, charging: 'Normal' as const, testedAt: '2026-04-17',
    },
    createdAt: '2026-04-17T10:00:00Z',
    updatedAt: '2026-04-17T10:00:00Z',
    grade: 'A',
    dealerCount: 7,
  },
  {
    id: 'demo-5',
    brand: 'Xiaomi',
    model: '14 Ultra',
    condition: 'NEW' as const,
    price: 42999,
    originalPrice: 49999,
    stock: 4,
    image: 'https://i02.appmifile.com/mi-com-product/fly-img/800/xiaomi-14-ultra/M/87db3be5-c90e-4a55-8e8e-f83b455e1272.png',
    images: [],
    imagesUrl: [],
    color: 'Black',
    storage: '512GB',
    cosmeticGrade: 'A+' as const,
    batteryHealth: 100,
    inStock: true,
    stockCount: 4,
    isHot: false,
    isSponsored: false,
    priority: 6,
    isOnCampaign: false,
    discountedPrice: null,
    campaignTag: null,
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'A+', batteryHealth: 100 },
    warrantyMonths: 12,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Kusursuz' as const, battery: 100, camera: 'Mükemmel' as const,
      speakers: 'Mükemmel' as const, faceId: false, touchId: true,
      wifi: true, cellular: true, charging: 'Hızlı Şarj' as const, testedAt: '2026-04-21',
    },
    createdAt: '2026-04-21T10:00:00Z',
    updatedAt: '2026-04-21T10:00:00Z',
    grade: 'A+',
    dealerCount: 1,
  },
  {
    id: 'demo-6',
    brand: 'Apple',
    model: 'iPhone 13',
    condition: 'SECOND_HAND' as const,
    price: 19999,
    originalPrice: 28999,
    stock: 15,
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-202207-midnight?wid=400&hei=400&fmt=jpeg',
    images: [],
    imagesUrl: [],
    color: 'Midnight',
    storage: '128GB',
    cosmeticGrade: 'B' as const,
    batteryHealth: 82,
    inStock: true,
    stockCount: 15,
    isHot: false,
    isSponsored: false,
    priority: 5,
    isOnCampaign: true,
    discountedPrice: 19999,
    campaignTag: 'Fırsat',
    campaignEndDate: null,
    specsJson: { cosmeticGrade: 'B', batteryHealth: 82 },
    warrantyMonths: 6,
    _sellerId: 'demo',
    store: null,
    testReport: {
      screen: 'Değiştirilmiş' as const, battery: 82, camera: 'İyi' as const,
      speakers: 'Çalışıyor' as const, faceId: true, touchId: false,
      wifi: true, cellular: true, charging: 'Normal' as const, testedAt: '2026-04-16',
    },
    createdAt: '2026-04-16T10:00:00Z',
    updatedAt: '2026-04-16T10:00:00Z',
    grade: 'B',
    dealerCount: 10,
  },
];

export const DEMO_SITE_CONFIG = {
  settings: {
    primaryColor: '#0f766e',
    fontFamily: 'Outfit',
    layoutDensity: 'standard',
    buttonStyle: 'pill',
    glassmorphismLevel: 20,
    animationSpeed: 'smooth',
    productCardStyle: 'detailed',
    enablePulseCTA: true,
    enableDarkMode: false,
    maintenanceMode: false,
    showHeroSlider: true,
    showServiceBubbles: true,
    showTrustBar: true,
    siteTitle: 'Mytt — Doğrulanmış Cihaz Pazaryeri',
    siteDesc: 'Garantili, uzman onaylı, sıfır ve hatasız 2. el cihazlar. 21 nokta kalite kontrol, 12 ay garanti.',
    logoUrl: '',
    faviconUrl: '',
    ticker: "🏆 Türkiye'nin En Güvenilir Cihaz Pazaryeri  |  🎉 Vade Farksız 12 Taksit  |  ✅ 21 Nokta Kalite Kontrol  |  🚀 Aynı Gün Kargo  |  💎 TSE Onaylı Premium Cihazlar",
    whatsappNumber: '+90 532 000 00 00',
    contactEmail: 'destek@mytt.com.tr',
    footerText: '© 2026 Mytt — Tüm hakları saklıdır.',
    floatingWhatsApp: true,
    bubbleRingColor: '#0f766e',
    categories: [
      { name: 'Apple', icon: null },
      { name: 'Samsung', icon: null },
      { name: 'Xiaomi', icon: null },
      { name: 'Tabletler', icon: null },
      { name: 'Aksesuarlar', icon: null },
    ],
    serviceBubbles: [
      { id: 1, title1: 'Vade Farksız', title2: '12 Taksit!', iconUrl: '', link: '/', bg: 'indigo' },
      { id: 2, title1: 'İndirimli', title2: 'Paket Ürünler', iconUrl: '', link: '/', bg: 'rose' },
      { id: 3, title1: 'Sıfır', title2: 'Telefonlar', iconUrl: '', link: '/', bg: 'emerald' },
      { id: 4, title1: 'Kaçmaz', title2: 'Fiyatlar!', iconUrl: '', link: '/', bg: 'amber' },
      { id: 5, title1: 'Akıllı', title2: 'Eşleştirme', iconUrl: '', link: '/', bg: 'sky' },
      { id: 6, title1: 'Mytt', title2: 'Güvencesi', iconUrl: '', link: '/', bg: 'violet' },
      { id: 7, title1: 'Mağazadan', title2: 'Teslim Al', iconUrl: '', link: '/', bg: 'fuchsia' },
      { id: 8, title1: 'Sıkça Sorulan', title2: 'Sorular', iconUrl: '', link: '/', bg: 'teal' },
    ],
    trustBar: [
      { icon: 'ShieldCheck', title: '12 Ay Garanti', desc: 'Tüm cihazlarda tam güvence.' },
      { icon: 'Truck', title: 'Aynı Gün Kargo', desc: "14:00'e kadar olan siparişler." },
      { icon: 'Recycle', title: 'Eskiyi Getir', desc: 'En iyi takas değerini verelim.' },
    ],
  },
};
