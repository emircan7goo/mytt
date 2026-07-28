'use client';
import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import {
  Check, ShieldCheck, Truck, Recycle, Heart, ShoppingCart,
  Zap, BadgeCheck, SlidersHorizontal, ArrowUpDown, Star,
  Battery, Package, CheckCircle2, Tag, Grid3X3, List,
  X, ChevronDown, ChevronRight, Search, Sliders, TrendingUp, Clock,
  Share2, Eye, Flame, AlertCircle, Sparkles, DollarSign,
  BarChart3, Filter, RotateCcw, Brain, RefreshCcw, Command,
  Smartphone, ArrowRight, Users, BadgeDollarSign, MapPin, Loader2,
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useFamilies, type FamilySummary } from '@/lib/hooks/useProducts';
import HeroSlider from '@/components/HeroSlider';
import ScrollReveal from '@/components/ScrollReveal';
import ServiceBubbles from '@/components/ServiceBubbles';
import MarketingTriggers from '@/components/MarketingTriggers';
import LiveSocialProof from '@/components/LiveSocialProof';
import HepsiburadaHero from '@/components/HepsiburadaHero';
import QuickValuationWidget from '@/components/QuickValuationWidget';
import BrandHubShowcase from '@/components/BrandHubShowcase';
import EscrowFlowInfographic from '@/components/EscrowFlowInfographic';
import { useSiteConfig, type FeatureCardConfig } from '@/lib/hooks/useSiteConfig';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import FamilyCard, { FamilyCardSkeleton } from '@/components/FamilyCard';
import { MENU_ITEMS } from '@/components/Navbar';

// ── Her marka için kendine özgü renk ──
const BRAND_COLORS: Record<string, { active: string; text: string; glow: string }> = {
  Apple:   { active: '#000000', text: '#ffffff', glow: 'rgba(0,0,0,0.25)'       },
  Samsung: { active: '#1428A0', text: '#ffffff', glow: 'rgba(20,40,160,0.25)'   },
  Xiaomi:  { active: '#FF6900', text: '#ffffff', glow: 'rgba(255,105,0,0.25)'   },
  Redmi:   { active: '#e53e3e', text: '#ffffff', glow: 'rgba(229,62,62,0.25)'   },
  POCO:    { active: '#FFD700', text: '#000000', glow: 'rgba(255,215,0,0.25)'   },
  Huawei:  { active: '#cf0a2c', text: '#ffffff', glow: 'rgba(207,10,44,0.25)'   },
  Vivo:    { active: '#4338ca', text: '#ffffff', glow: 'rgba(67,56,202,0.25)'   },
  Realme:  { active: '#EA580C', text: '#ffffff', glow: 'rgba(234,88,12,0.25)'   },
  Tecno:   { active: '#0d9488', text: '#ffffff', glow: 'rgba(13,148,136,0.25)'  },
  Infinix: { active: '#16a34a', text: '#ffffff', glow: 'rgba(22,163,74,0.25)'   },
  Aksesuarlar: { active: '#EA580C', text: '#ffffff', glow: 'rgba(234,88,12,0.25)' },
};

const DEFAULT_BRAND_COLOR = { active: '#52525b', text: '#ffffff', glow: 'rgba(82,82,91,0.25)' };

function brandMonogram(brand: string): string {
  const parts = brand.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return brand.slice(0, 2).toUpperCase();
}

const GRADE_CLASS: Record<string, string> = {
  'A+': 'grade-badge--a-plus',
  'A':  'grade-badge--a',
  'B':  'grade-badge--b',
};

const PRICE_CHIPS = [
  { label: '0 – 5.000',       min: 0,     max: 5000   },
  { label: '5.000 – 15.000',  min: 5000,  max: 15000  },
  { label: '15.000 – 30.000', min: 15000, max: 30000  },
  { label: '30.000 – 50.000', min: 30000, max: 50000  },
  { label: '50.000+',         min: 50000, max: 999999 },
] as const;

const DynamicIcon = ({ name, ...props }: { name: string; [key: string]: any }) => {
  const icons: Record<string, any> = { ShieldCheck, Truck, Recycle, Heart, ShoppingCart, Zap, BadgeCheck, Check };
  const C = icons[name] || Check;
  return <C {...props} />;
};

// ── Feature Cards: fallback & static visual metadata ──────────────────────────
const DEFAULT_FEATURE_CARDS: FeatureCardConfig[] = [
  {
    id: 'sell',
    enabled: true,
    title: 'Cihazını Hemen Sat',
    description: 'Yetkili bayiler cihazın için 1 saat içinde kapalı tekliflerde yarışsın. En yüksek teklifi seç, ücretsiz kargola, paranı Escrow güvencesiyle anında al.',
    badgeText: 'Anında Kapalı Teklif',
    tag: 'Sıfır Komisyon',
    features: ['Şeffaf açık artırma teklifleri', 'Ücretsiz kargo & kapıdan teslimat', '%100 Güvenli Escrow ödeme koruması'],
    stat: '150+',
    statLabel: 'Onaylı Yetkili Bayi',
    ctaText: 'Teklif Al',
  },
  {
    id: 'ai-finder',
    enabled: true,
    title: 'Yapay Zekâ Akıllı Telefon Bulucu',
    description: 'Bütçenizi, kullanım alışkanlıklarınızı ve kamera/pil beklentilerinizi analiz edip size özel en uygun 3 ideal cihazı saniyeler içinde önerelim.',
    badgeText: 'YZ Akıllı Analiz',
    tag: 'Kişiye Özel',
    features: ['Kullanım profili analizi', 'Fiyat / performans oranlaması', 'Kişiselleştirilmiş 3 seçenek'],
    stat: '3',
    statLabel: 'Size Özel Öneri',
    ctaText: 'Telefonumu Bul',
  },
  {
    id: 'trade-in',
    enabled: true,
    title: 'Eskiyi Getir, Yeniyi Al (Takas)',
    description: 'Eski telefonunuzun güncel piyasa değerini saniyeler içinde hesaplayın, yeni alacağınız cihazda doğrudan indirim avantajıyla hemen kullanın.',
    badgeText: 'Piyasa Değeri',
    tag: 'Anında İndirim',
    features: ['Canlı piyasa değerlemesi', 'Cihaz fiyatından düşülen indirim', 'Adresten hızlı değişim'],
    stat: '%40',
    statLabel: 'Varan Takas İndirimi',
    ctaText: 'Değerini Hesapla',
  },
];

/** Per-card visual design tokens — not editable by admin */
const CARD_META: Record<string, {
  gradient: string;
  badgeCls: string;
  link: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  glowColor: string;
}> = {
  sell: {
    gradient:    'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    badgeCls:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    link:        '/sell',
    iconBg:      'bg-emerald-50',
    iconColor:   'text-emerald-600',
    borderColor: 'group-hover:border-emerald-500/40',
    glowColor:   'rgba(16,185,129,0.18)',
  },
  'ai-finder': {
    gradient:    'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
    badgeCls:    'bg-indigo-50 text-indigo-700 border border-indigo-200',
    link:        '/ai-finder',
    iconBg:      'bg-indigo-50',
    iconColor:   'text-indigo-600',
    borderColor: 'group-hover:border-indigo-500/40',
    glowColor:   'rgba(99,102,241,0.18)',
  },
  'trade-in': {
    gradient:    'linear-gradient(135deg, #D97706 0%, #F59E0B 100%)',
    badgeCls:    'bg-amber-50 text-amber-700 border border-amber-200',
    link:        '/trade-in',
    iconBg:      'bg-amber-50',
    iconColor:   'text-amber-600',
    borderColor: 'group-hover:border-amber-500/40',
    glowColor:   'rgba(245,158,11,0.18)',
  },
};

// Fiyat girişi için debounce hook'u
function useDebouncedPriceRange(
  priceRange: number[],
  setPriceRange: (v: number[]) => void,
) {
  const [localMin, setLocalMin] = useState(String(priceRange[0]));
  const [localMax, setLocalMax] = useState(String(priceRange[1]));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocalMin(String(priceRange[0]));
    setLocalMax(String(priceRange[1]));
  }, [priceRange[0], priceRange[1]]);

  const handleMin = (raw: string) => {
    setLocalMin(raw);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const n = Number(raw.replace(/\D/g, ''));
      if (!isNaN(n) && n >= 0) setPriceRange([n, priceRange[1]]);
    }, 600);
  };

  const handleMax = (raw: string) => {
    setLocalMax(raw);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const n = Number(raw.replace(/\D/g, ''));
      if (!isNaN(n) && n >= 0) setPriceRange([priceRange[0], n]);
    }, 600);
  };

  return { localMin, localMax, handleMin, handleMax };
}

function HomePageContent() {
  const { searchQuery, setSearchQuery, addToCart, openCart, toggleWishlist, isInWishlist } = useApp();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortMode, setSortMode] = useState('recommended');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [warrantyOnly, setWarrantyOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { localMin, localMax, handleMin, handleMax } = useDebouncedPriceRange(priceRange, setPriceRange);

  const [sameDayMode,    setSameDayMode]    = useState(false);
  const [nearbyStoreIds, setNearbyStoreIds] = useState<Set<string> | null>(null);
  const [locationLoading,setLocationLoading]= useState(false);

  const handleSameDayToggle = useCallback(async () => {
    if (sameDayMode) {
      setSameDayMode(false);
      setNearbyStoreIds(null);
      return;
    }
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum özelliğini desteklemiyor.');
      return;
    }
    setLocationLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout:            8000,
          maximumAge:         60_000,
          enableHighAccuracy: false,
        })
      );
      const { latitude: lat, longitude: lng } = position.coords;

      const { data } = await apiClient.get<{ id: string }[]>('/stores/nearby', {
        params: { lat, lng, radius: 100 },
      });

      const ids = new Set<string>(data.map(s => s.id));
      if (ids.size === 0) {
        toast.info('100 km çevrenizde kayıtlı mağaza bulunamadı.');
        return;
      }
      setNearbyStoreIds(ids);
      setSameDayMode(true);
      setCurrentPage(1);
      toast.success(`${ids.size} yakın mağazanın ürünleri gösteriliyor 🚀`);
    } catch (err: any) {
      if (err?.code === 1 || err?.message?.includes('denied')) {
        toast.error('Konum izni reddedildi. Tarayıcı adres çubuğundaki kilit simgesinden izin verin.');
      } else {
        toast.error('Konum alınamadı. Lütfen tekrar deneyin.');
      }
    } fontinally: {
      setLocationLoading(false);
    }
  }, [sameDayMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
    const cat = searchParams.get('cat');
    if (cat) setSelectedBrand(cat);
  }, [searchParams]);

  const { data: configData, isLoading: isConfigLoading } = useSiteConfig();
  const { data: families = [], isLoading: isProductsLoading } = useFamilies();

  const configReady       = mounted && !isConfigLoading;
  const configDataSettings = configReady ? configData?.settings : undefined;
  const isLoading     = isProductsLoading;

  const brands   = useMemo(() => Array.from(new Set(families.map(f => f.brand))).sort(), [families]);
  const colors   = useMemo(() => Array.from(new Set(families.flatMap(f => f.colorOptions))).sort(), [families]);
  const storages = useMemo(() => Array.from(new Set(families.flatMap(f => f.storageOptions))).sort((a, b) => parseInt(a) - parseInt(b)), [families]);
  const priceStats = useMemo(() => {
    if (families.length === 0) return { min: 0, max: 100000 };
    return {
      min: Math.min(...families.map(f => f.minPrice)),
      max: Math.max(...families.map(f => f.maxPrice)),
    };
  }, [families]);

  const filteredProducts = useMemo(() => {
    let list = [...families];
    if (selectedBrand)   list = list.filter(f => f.brand === selectedBrand);
    if (selectedGrade)   list = list.filter(f => f.availableGrades.includes(selectedGrade));
    if (selectedColor)   list = list.filter(f => f.colorOptions.includes(selectedColor));
    if (selectedStorage) list = list.filter(f => f.storageOptions.includes(selectedStorage));
    if (warrantyOnly)    list = list.filter(f => f.hasWarrantyOffer);
    list = list.filter(f => f.maxPrice >= priceRange[0] && f.minPrice <= priceRange[1]);

    if (sameDayMode && nearbyStoreIds) {
      list = list.filter(f => f.storeIds.some(id => nearbyStoreIds.has(id)));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        f.brand.toLowerCase().includes(q) ||
        f.model.toLowerCase().includes(q)
      );
    }

    if (sortMode === 'asc')     list.sort((a, b) => a.minPrice - b.minPrice);
    if (sortMode === 'desc')    list.sort((a, b) => b.maxPrice - a.maxPrice);
    if (sortMode === 'newest')  list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    if (sortMode === 'popular') list.sort((a, b) => b.offerCount - a.offerCount);

    return list;
  }, [families, selectedBrand, selectedGrade, selectedColor, selectedStorage, warrantyOnly, priceRange, searchQuery, sortMode, sameDayMode, nearbyStoreIds]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBrand)   count++;
    if (selectedGrade)   count++;
    if (selectedColor)   count++;
    if (selectedStorage) count++;
    if (warrantyOnly)    count++;
    if (priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) count++;
    if (searchQuery.trim()) count++;
    if (sameDayMode)     count++;
    return count;
  }, [selectedBrand, selectedGrade, selectedColor, selectedStorage, warrantyOnly, priceRange, priceStats, searchQuery, sameDayMode]);

  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedGrade(null);
    setSelectedColor(null);
    setSelectedStorage(null);
    setWarrantyOnly(false);
    setPriceRange([priceStats.min, priceStats.max]);
    setSearchQuery('');
    setSameDayMode(false);
    setNearbyStoreIds(null);
    setCurrentPage(1);
  };

  const sortOptions = [
    { id: 'recommended', label: 'Önerilen'   },
    { id: 'newest',      label: 'En Yeni'    },
    { id: 'popular',     label: 'En Popüler' },
    { id: 'asc',         label: 'En Ucuz'    },
    { id: 'desc',        label: 'En Pahalı'  },
  ];
  const activeSortLabel = sortOptions.find(o => o.id === sortMode)?.label || 'Önerilen';

  const SidebarContent = () => (
    <div className="flex flex-col pb-8">
      <div className="flex items-center justify-between lg:hidden mb-6 px-2">
        <h3 className="font-black text-2xl text-[var(--k-ink)]">Filtreler</h3>
        <button onClick={() => setShowMobileFilters(false)}
                className="p-2 text-[var(--k-ink-3)] hover:text-[var(--k-ink)] bg-[var(--k-surface-3)] hover:bg-[var(--k-surface-3)] rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="lg:hidden flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-semibold text-[var(--k-ink-3)]">{activeFiltersCount} filtre aktif</span>
          <button onClick={resetFilters}
                  className="text-sm font-bold text-[var(--k-bad)] bg-[rgba(255,92,92,0.10)] hover:bg-[rgba(255,92,92,0.18)] px-3 py-1.5 rounded-lg transition-colors border border-[rgba(255,92,92,0.30)]">
            Sıfırla
          </button>
        </div>
      )}

      <div className="relative group mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Kelime veya model ara..."
          className="w-full pl-4 pr-10 py-2.5 bg-[var(--k-surface)] border border-[var(--k-line-2)] rounded-lg text-sm text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)]">
          <Search size={16} />
        </div>
      </div>

      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="bg-[var(--k-surface-2)] px-4 py-2.5 border-b border-[var(--k-line)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--k-ink-2)]">Marka</span>
        </div>
        <div className="p-3 bg-[var(--k-surface)] space-y-2">
          {brands.map(brand => {
            const isActive = selectedBrand === brand;
            const bc = BRAND_COLORS[brand] ?? DEFAULT_BRAND_COLOR;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(isActive ? null : brand)}
                className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all"
                  style={{
                    background: bc.active,
                    color: bc.text,
                    boxShadow: isActive ? `0 0 0 3px ${bc.glow}` : 'none',
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  {brandMonogram(brand)}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-[var(--k-ink)]' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                  {brand}
                </span>
                {isActive && <Check size={12} strokeWidth={3} className="ml-auto text-orange-600" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="bg-[var(--k-surface-2)] px-4 py-2.5 border-b border-[var(--k-line)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--k-ink-2)]">Kozmetik Durum</span>
        </div>
        <div className="p-3 bg-[var(--k-surface)] space-y-2">
          {(['A+', 'A', 'B', 'C'] as const).map(grade => {
            const gradeData: Record<string, { label: string }> = {
              'A+': { label: 'Kusursuz' },
              'A':  { label: 'Çok İyi' },
              'B':  { label: 'İyi' },
              'C':  { label: 'Kabul Edilebilir' },
            };
            const gd = gradeData[grade];
            const isActive = selectedGrade === grade;
            return (
              <button
                key={grade}
                onClick={() => setSelectedGrade(isActive ? null : grade)}
                className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? "bg-orange-600 border-orange-600 text-white" : 'border-[var(--k-line-2)] bg-[var(--k-surface)] group-hover:border-[var(--k-ink-4)]'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-[var(--k-ink)]' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                  {grade} <span className="text-[10px] text-[var(--k-ink-4)] font-normal">({gd.label})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full py-2 bg-[rgba(255,92,92,0.10)] text-[var(--k-bad)] font-bold text-xs rounded-lg hover:bg-[rgba(255,92,92,0.18)] transition-colors border border-[rgba(255,92,92,0.30)] flex items-center justify-center gap-1.5"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-slate-100/70 text-slate-800">

      {/* ── HEPSİBURADA HERO SAHNESİ (10 İkon Barı + İkili Banner) ── */}
      {!searchQuery && <HepsiburadaHero />}

      {/* ── TİCARİ WİDGETLAR & VİTRİNLER ── */}
      {!searchQuery && (
        <section className="relative w-full py-6">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <QuickValuationWidget />
            <BrandHubShowcase />
            <EscrowFlowInfographic />
          </div>
        </section>
      )}

      {/* ── PAZARLAMA & GÜVEN DÖNÜŞÜM KATMANI ──────────────────────────── */}
      {!searchQuery && (
        <div className="relative z-10 my-6">
          <MarketingTriggers />
        </div>
      )}

      {/* ── MAIN CONTENT (SIDEBAR + GRID) ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-8 mt-6 pb-12 flex flex-col lg:flex-row gap-8 lg:gap-10">

        <div className="hidden lg:block w-[280px] flex-shrink-0 relative">
          <div className="sticky top-24 bg-[var(--k-surface)] rounded-xl border border-[var(--k-line)] p-4 shadow-sm">
            <SidebarContent />
          </div>
        </div>

        <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-[rgba(255,106,26,0.5)] backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--k-surface)] shadow-2xl overflow-y-auto px-5 py-6 transition-transform duration-300 transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
            <SidebarContent />
          </div>
        </div>

        <div className="flex-1 min-w-0">

          <div className="sticky top-[80px] z-40 mb-6">
            <div className="bg-[var(--k-surface)] rounded-xl p-4 border border-[var(--k-line)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg tracking-tight text-[var(--k-ink)]">
                  {sameDayMode
                    ? '🚀 Gün İçi Teslim'
                    : searchQuery
                      ? `"${searchQuery}" Sonuçları`
                      : 'Tüm Cihazlar'}
                </h2>
                {!isLoading && (
                  <span className="inline-flex items-center text-xs font-medium text-[var(--k-ink-3)] mt-0.5">
                    <b className="text-orange-600 mr-1">{filteredProducts.length}</b>
                    {sameDayMode ? ' cihaz — yakınında, bugün teslim' : ' cihaz listeleniyor'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSameDayToggle}
                  disabled={locationLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all shadow-sm disabled:opacity-60 ${ sameDayMode ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/30 shadow-lg' : 'bg-[var(--k-surface)] border-[var(--k-line)] text-[var(--k-ink-2)] hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)]' }`}
                >
                  {locationLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <MapPin size={15} className={sameDayMode ? 'text-white' : 'text-[var(--k-hot)]'} />
                  }
                  <span className="hidden sm:inline">
                    {locationLoading ? 'Konum Alınıyor…' : sameDayMode ? 'Gün İçi Teslim' : 'Gün İçi Teslim'}
                  </span>
                </button>
                <div className="flex items-center gap-1 p-1 bg-[var(--k-surface-3)] rounded-xl border border-[var(--k-line)]">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--k-surface)] text-[var(--k-ink)] shadow-sm border border-[var(--k-line)]' : 'text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)]'}`}
                  >
                    <Grid3X3 size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[var(--k-surface)] text-[var(--k-ink)] shadow-sm border border-[var(--k-line)]' : 'text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)]'}`}
                  >
                    <List size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <FamilyCardSkeleton key={i} />
              ))}
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-16 bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] p-8">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                🔍
              </div>
              <h3 className="font-bold text-xl text-[var(--k-ink)] mb-2">Henüz Cihaz Eklenmedi</h3>
              <p className="text-sm text-[var(--k-ink-3)] max-w-md mx-auto mb-6">
                Seçtiğiniz kriterlerde henüz listelenmiş bir cihaz bulunmuyor.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-orange-600 text-white font-bold text-sm rounded-xl hover:bg-orange-700 transition-colors shadow-md shadow-orange-600/20"
              >
                Tüm Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
              {paginatedProducts.map((family, idx) => (
                <FamilyCard key={`${family.brand}-${family.model}`} family={family} index={idx} />
              ))}
            </div>
          )}
        </div>
      </div>

      <LiveSocialProof />
    </div>
  );
}

export default function HomePageClient() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
