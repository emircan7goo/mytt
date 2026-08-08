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
import { useTheme } from '@/providers/ThemeContext';
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
import TrendyolCircleBar from '@/components/TrendyolCircleBar';
import TrendyolSpecialProducts from '@/components/TrendyolSpecialProducts';
import FlashDealArena from '@/components/FlashDealArena';
import VerifiedReviewsSection from '@/components/VerifiedReviewsSection';
import SEOContentBlock from '@/components/SEOContentBlock';
import MyttWorldGrid from '@/components/MyttWorldGrid';
import MobileBottomNav from '@/components/MobileBottomNav';
import { useSiteConfig, type FeatureCardConfig } from '@/lib/hooks/useSiteConfig';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import FamilyCard, { FamilyCardSkeleton } from '@/components/FamilyCard';
import { getBrandLogo, normalizeBrandName } from '@/lib/brandLogos';
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
    badgeCls:    'bg-[var(--k-hot-wash)] text-[var(--k-hot)] border border-[var(--k-line-hot)]',
    link:        '/trade-in',
    iconBg:      'bg-[var(--k-hot-wash)]',
    iconColor:   'text-[var(--k-hot)]',
    borderColor: 'group-hover:border-[var(--k-hot-deep)]/40',
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
  const { theme } = useTheme();
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
    const q = searchParams.get('q');

    if (cat) {
      setSelectedBrand(cat);
    } else {
      setSelectedBrand(null);
    }

    if (q) {
      setSearchQuery(q);
    } else if (!cat) {
      setSearchQuery('');
    }
  }, [searchParams, setSearchQuery]);

  const { data: configData, isLoading: isConfigLoading } = useSiteConfig();
  const { data: families = [], isLoading: isProductsLoading } = useFamilies();

  const configReady       = mounted && !isConfigLoading;
  const configDataSettings = configReady ? configData?.settings : undefined;
  const isLoading     = isProductsLoading;

  const brands   = useMemo(() => Array.from(new Set(families.map(f => normalizeBrandName(f.brand)))).sort(), [families]);
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

    if (selectedBrand) {
      const bLower = selectedBrand.toLowerCase();
      list = list.filter(f => {
        const fBrand = f.brand.toLowerCase();
        if (fBrand === bLower) return true;
        if (bLower === 'apple' && fBrand.includes('apple')) return true;
        if (bLower === 'samsung' && fBrand.includes('samsung')) return true;
        if (bLower === 'xiaomi' && (fBrand.includes('xiaomi') || fBrand.includes('redmi') || fBrand.includes('poco'))) return true;
        if (bLower === 'poco' && (fBrand.includes('poco') || fBrand.includes('xiaomi') || fBrand.includes('redmi'))) return true;
        if (bLower === 'huawei' && (fBrand.includes('huawei') || fBrand.includes('honor'))) return true;
        if (bLower === 'diğer' && !['apple', 'samsung', 'xiaomi', 'poco', 'redmi', 'huawei', 'honor'].includes(fBrand)) return true;
        return false;
      });
    }

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
      const directMatches = list.filter(f =>
        f.brand.toLowerCase().includes(q) ||
        f.model.toLowerCase().includes(q)
      );

      if (directMatches.length > 0) {
        list = directMatches;
      } else {
        // Tam aranan model (ör. iPhone 17 veya S25) henüz piyasaya sürülmediyse veya stokta yoksa,
        // boş kalmasın diye aranan markanın en popüler akıllı cihazlarını zekice göster!
        const brandMatches = list.filter(f =>
          q.includes(f.brand.toLowerCase()) || f.brand.toLowerCase().includes(q.split(' ')[0])
        );
        if (brandMatches.length > 0) {
          list = brandMatches;
        }
      }
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

      <div className="relative group mb-5">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Kelime veya model ara..."
          className="w-full pl-4 pr-10 py-2.5 bg-[#161922] border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <Search size={16} />
        </div>
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden mb-4 bg-[#161922] shadow-md">
        <div className="bg-[#1C202B] px-4 py-3 border-b border-slate-800/80 flex justify-between items-center">
          <span className="text-xs font-black text-slate-200 tracking-wider uppercase">Marka</span>
        </div>
        <div className="p-2.5 bg-[#161922] space-y-1">
          {brands.map(brand => {
            const isActive = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(isActive ? null : brand)}
                className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 font-extrabold border border-orange-500/40 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <span className="truncate">{brand}</span>
                {isActive && <Check size={14} strokeWidth={3} className="text-orange-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border border-slate-800 rounded-2xl overflow-hidden mb-4 bg-[#161922] shadow-md">
        <div className="bg-[#1C202B] px-4 py-3 border-b border-slate-800/80 flex justify-between items-center">
          <span className="text-xs font-black text-slate-200 tracking-wider uppercase">Kozmetik Durum</span>
        </div>
        <div className="p-3 bg-[#161922] space-y-2">
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
                  isActive ? "bg-orange-500 border-orange-500 text-white" : 'border-slate-700 bg-slate-800 group-hover:border-slate-500'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-white' : 'text-slate-300 group-hover:text-white'}`}>
                  {grade} <span className="text-[10px] text-slate-400 font-normal">({gd.label})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full py-2.5 bg-rose-500/10 text-rose-400 font-extrabold text-xs rounded-xl hover:bg-rose-500/20 transition-colors border border-rose-500/30 flex items-center justify-center gap-1.5"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <div className={`min-h-screen font-sans ${theme === 'dark' ? 'bg-[var(--k-void)] text-white' : 'bg-[var(--k-surface-2)] text-[var(--k-ink)]'} transition-colors duration-300`}>

      {/* ── 1. HERO SLIDER BANNER ── */}
      {!searchQuery && <HepsiburadaHero />}

      {/* ── TİCARİ WİDGETLAR & VİTRİNLER ── */}
      {!searchQuery && (
        <section className="relative w-full py-6">
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 space-y-6">
            <FlashDealArena products={families} />
            <QuickValuationWidget />
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

          <div className="sticky top-[75px] z-40 mb-5">
            <div className="bg-[#161922] rounded-2xl p-3.5 border border-slate-800 shadow-md flex items-center justify-between gap-3">
              <div>
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  {searchQuery ? `"${searchQuery}" Sonuçları` : 'Tüm Cihazlar'}
                </h2>
                {!isLoading && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-slate-400 mt-0.5">
                    <b className="text-orange-400 mr-1">{filteredProducts.length}</b>
                    cihaz listeleniyor
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Mobil Filtre Aç Butonu */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                >
                  <Filter size={14} className="text-orange-400" />
                  <span>Filtrele</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-orange-500 text-white font-black text-[10px] flex items-center justify-center ml-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <Grid3X3 size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    <List size={16} strokeWidth={2.5} />
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
              <div className="w-16 h-16 bg-[var(--k-hot-wash)] text-[var(--k-hot)] rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                🔍
              </div>
              <h3 className="font-bold text-xl text-[var(--k-ink)] mb-2">Henüz Cihaz Eklenmedi</h3>
              <p className="text-sm text-[var(--k-ink-3)] max-w-md mx-auto mb-6">
                Seçtiğiniz kriterlerde henüz listelenmiş bir cihaz bulunmuyor.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[var(--k-hot-deep)] text-white font-bold text-sm rounded-xl hover:bg-[var(--k-hot-deep)] transition-colors shadow-md shadow-[var(--k-hot-glow)]/20"
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

      {/* ── MOBİL SABİT ALT NAVİGASYON BARI ── */}
      <MobileBottomNav />

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
