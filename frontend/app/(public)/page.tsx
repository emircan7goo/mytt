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
    title: 'Cihazını Sat',
    description: 'Yüzlerce yetkili bayi cihazın için kapalı teklifte yarışır. En yüksek teklifi onayla, kargola, paranı al.',
    badgeText: '1 Saatte Teklif',
    tag: 'Ücretsiz',
    features: ['Bayiler birbirinin teklifini göremez', 'Cihaz kargosuz teslim edilir', 'Ödeme garanti ile yapılır'],
    stat: '150+',
    statLabel: 'Aktif Bayi',
    ctaText: 'Başla',
  },
  {
    id: 'ai-finder',
    enabled: true,
    title: 'AI Telefon Bulucu',
    description: 'Bütçenizi ve kullanım alışkanlıklarınızı analiz edip size özel en iyi 3 cihazı anında listeleyelim.',
    badgeText: 'YZ Destekli',
    tag: 'Saniyeler içinde',
    features: ['Bütçe & ihtiyaç analizi yapılır', 'Kişiye özel 3 cihaz önerilir', 'Anlık fiyat karşılaştırması'],
    stat: '3',
    statLabel: 'Kişisel Öneri',
    ctaText: 'Hemen Bul',
  },
  {
    id: 'trade-in',
    enabled: true,
    title: 'Trade-In Hesaplayıcı',
    description: 'Eski telefonunuzun güncel piyasa değerini öğrenin, yeni cihazınızı çok daha uygun fiyata alın.',
    badgeText: 'Anlık Fiyat',
    tag: 'Ücretsiz',
    features: ['Güncel piyasa fiyatı gösterilir', 'Yeni cihazda doğrudan indirim', 'Güvenli & hızlı takas işlemi'],
    stat: '%40',
    statLabel: 'a kadar tasarruf',
    ctaText: 'Değerini Öğren',
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
    gradient:    'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
    badgeCls:    'bg-orange-500/10 text-orange-500 border border-orange-500/20',
    link:        '/sell',
    iconBg:      'bg-orange-50',
    iconColor:   'text-orange-600',
    borderColor: 'group-hover:border-orange-500/30',
    glowColor:   'rgba(249,115,22,0.15)',
  },
  'ai-finder': {
    gradient:    'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
    badgeCls:    'bg-blue-500/10 text-blue-500 border border-blue-500/20',
    link:        '/ai-finder',
    iconBg:      'bg-blue-50',
    iconColor:   'text-blue-600',
    borderColor: 'group-hover:border-blue-500/30',
    glowColor:   'rgba(37,99,235,0.15)',
  },
  'trade-in': {
    gradient:    'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    badgeCls:    'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    link:        '/trade-in',
    iconBg:      'bg-amber-50',
    iconColor:   'text-amber-600',
    borderColor: 'group-hover:border-amber-500/30',
    glowColor:   'rgba(217,119,6,0.15)',
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

  // Filtre dışarıdan değişirse (chip seçimi vb.) local state güncelle
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

function HomePage() {
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

  // ── Gün İçi Teslim (Konum Bazlı) ─────────────────────────────────────────────
  const [sameDayMode,    setSameDayMode]    = useState(false);
  const [nearbyStoreIds, setNearbyStoreIds] = useState<Set<string> | null>(null);
  const [locationLoading,setLocationLoading]= useState(false);

  const handleSameDayToggle = useCallback(async () => {
    // Kapatma
    if (sameDayMode) {
      setSameDayMode(false);
      setNearbyStoreIds(null);
      return;
    }
    // Açma — konum iste
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

      // Yakındaki mağazaları getir — 100 km çevre
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
    } finally {
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
  const showHero      = configReady ? (configDataSettings?.showHeroSlider     ?? true)  : true;
  const showBubbles   = configReady ? (configDataSettings?.showServiceBubbles ?? true)  : true;
  const showTrustBar  = configReady ? (configDataSettings?.showTrustBar       ?? true)  : false;
  const TRUST_BAR     = configReady ? (configDataSettings?.trustBar           || [])    : [];
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

  // Her kart artık tek bir bayi teklifi değil, bir marka+model AİLESİ
  // (ör. tüm "iPhone 12" varyant/teklifleri tek kartta). Detaya girince
  // /urun/[brand]/[model] sayfasında hepsi karşılaştırmalı listelenir.
  const filteredProducts = useMemo(() => {
    let list = [...families];
    if (selectedBrand)   list = list.filter(f => f.brand === selectedBrand);
    if (selectedGrade)   list = list.filter(f => f.availableGrades.includes(selectedGrade));
    if (selectedColor)   list = list.filter(f => f.colorOptions.includes(selectedColor));
    if (selectedStorage) list = list.filter(f => f.storageOptions.includes(selectedStorage));
    if (warrantyOnly)    list = list.filter(f => f.hasWarrantyOffer);
    // Fiyat aralığı — ailenin fiyat yelpazesi seçilen aralıkla kesişiyorsa göster
    list = list.filter(f => f.maxPrice >= priceRange[0] && f.minPrice <= priceRange[1]);

    // Gün İçi Teslim — ailedeki tekliflerden en az biri yakın bir mağazadan geliyorsa göster
    // Bayi kimliği kullanıcıya asla gösterilmez, sadece filtre anahtarı olarak kullanılır
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

  const Divider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-orange-200 to-transparent my-6" />
  );

  // ── Sidebar ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col pb-8">
      {/* Mobile header */}
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

      {/* Arama */}
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

      {/* Marka */}
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

      {/* Kozmetik Durum */}
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

      {/* Kapasite */}
      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="bg-[var(--k-surface-2)] px-4 py-2.5 border-b border-[var(--k-line)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--k-ink-2)]">Kapasite</span>
        </div>
        <div className="p-3 bg-[var(--k-surface)] space-y-2">
          {storages.map(storage => {
            const isActive = selectedStorage === storage;
            return (
              <button
                key={storage}
                onClick={() => setSelectedStorage(isActive ? null : storage)}
                className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? "bg-orange-600 border-orange-600 text-white" : 'border-[var(--k-line-2)] bg-[var(--k-surface)] group-hover:border-[var(--k-ink-4)]'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-[var(--k-ink)]' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                  {storage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renk */}
      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="bg-[var(--k-surface-2)] px-4 py-2.5 border-b border-[var(--k-line)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--k-ink-2)]">Renk</span>
        </div>
        <div className="p-3 bg-[var(--k-surface)] max-h-40 overflow-y-auto space-y-2">
          {colors.map(color => {
            const isActive = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(isActive ? null : color)}
                className="flex items-center gap-2.5 w-full text-left py-0.5 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? "bg-orange-600 border-orange-600 text-white" : 'border-[var(--k-line-2)] bg-[var(--k-surface)] group-hover:border-[var(--k-ink-4)]'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-[var(--k-ink)]' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                  {color}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fiyat */}
      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="bg-[var(--k-surface-2)] px-4 py-2.5 border-b border-[var(--k-line)] flex justify-between items-center">
          <span className="text-xs font-bold text-[var(--k-ink-2)]">Fiyat (TL)</span>
        </div>
        <div className="p-3 bg-[var(--k-surface)]">
          <div className="flex items-center gap-1.5 mb-3">
            <input
              type="number"
              value={localMin}
              onChange={e => handleMin(e.target.value)}
              onBlur={e => {
                const n = Number(e.target.value);
                if (!isNaN(n)) setPriceRange([n, priceRange[1]]);
              }}
              placeholder="Min"
              className="w-full px-2 py-1.5 border border-[var(--k-line-2)] rounded text-xs text-[var(--k-ink)] outline-none focus:border-orange-500"
            />
            <span className="text-[var(--k-ink-4)] text-xs">-</span>
            <input
              type="number"
              value={localMax}
              onChange={e => handleMax(e.target.value)}
              onBlur={e => {
                const n = Number(e.target.value);
                if (!isNaN(n)) setPriceRange([priceRange[0], n]);
              }}
              placeholder="Max"
              className="w-full px-2 py-1.5 border border-[var(--k-line-2)] rounded text-xs text-[var(--k-ink)] outline-none focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-1" suppressHydrationWarning>
            {PRICE_CHIPS.map(({ label, min, max }) => {
              const isActive = priceRange[0] === min && priceRange[1] === max;
              return (
                <button
                  key={label}
                  onClick={() => setPriceRange([min, max])}
                  className={`py-1 px-2 border rounded text-[10px] text-center transition-all ${
                    isActive ? "bg-[var(--k-hot-wash)] border-[var(--k-hot)] text-[var(--k-hot)] font-bold" : 'bg-[var(--k-surface)] border-[var(--k-line)] text-[var(--k-ink-3)] hover:border-[var(--k-line-2)]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Garanti */}
      <div className="border border-[var(--k-line)] rounded-lg overflow-hidden mb-4">
        <div className="p-3 bg-[var(--k-surface)]">
          <button
            onClick={() => setWarrantyOnly(!warrantyOnly)}
            className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
              warrantyOnly ? "bg-orange-600 border-orange-600 text-white" : 'border-[var(--k-line-2)] bg-[var(--k-surface)] group-hover:border-[var(--k-ink-4)]'
            }`}>
              {warrantyOnly && <Check size={12} strokeWidth={3} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs transition-colors ${warrantyOnly ? 'font-bold text-[var(--k-ink)]' : 'text-[var(--k-ink-2)] group-hover:text-[var(--k-ink)]'}`}>
                VIP Garantili Cihazlar
              </span>
              <span className="text-[9px] text-[var(--k-ink-4)]">Sadece garantili ürünleri filtrele</span>
            </div>
          </button>
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

  // ── Page ──────────────────────────────────────────────────────────
  return (
    <div className="k-grain min-h-screen font-sans" style={{ background: 'var(--k-canvas)', color: 'var(--k-ink-2)' }}>

      {/* ── HERO — tam kanvas, kutu içinde değil ── */}
      <div className="relative z-10">
        {!searchQuery && showHero && <HeroSlider />}
      </div>

      {/* ── BENTO: NE YAPMAK İSTERSİNİZ ─────────────────────────────────────
          Kart içeriği hâlâ admin builder'dan (configDataSettings.featureCards)
          geliyor — sadece sunum KARBON bento ızgarasına taşındı. */}
      <div className="relative z-10">
        {!searchQuery && (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 mt-20 mb-6">

            {/* Bölüm başlığı — editoryal, numaralı */}
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="k-section-num">01 — SERVİSLER</span>
                <h2
                  className="k-display mt-4"
                  style={{ fontSize: 'clamp(1.9rem, 4vw, 3.1rem)' }}
                >
                  Al, sat, takas et.
                  <br />
                  <span style={{ color: 'var(--k-ink-4)' }}>Hepsi tek çatı altında.</span>
                </h2>
              </div>
              <p className="max-w-[330px] text-[14px] leading-relaxed" style={{ color: 'var(--k-ink-3)' }}>
                Cihazını bayilere açık artırmayla sattır, yapay zekâ ile sana en uygun
                modeli bul, ya da eskisini yenisine say.
              </p>
            </div>

            {/* Bento ızgara */}
            {(() => {
              const cards = (configDataSettings?.featureCards ?? DEFAULT_FEATURE_CARDS)
                .filter(c => c.enabled !== false);

              const ICONS: Record<string, any> = {
                'sell': Smartphone,
                'ai-finder': Brain,
                'trade-in': RefreshCcw,
              };

              return (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  {cards.map((card, i) => {
                    const meta = CARD_META[card.id];
                    if (!meta) return null;
                    const Icon = ICONS[card.id] ?? Smartphone;
                    // İlk kart geniş (bento asimetrisi), diğerleri dar
                    const span = i === 0 ? 'md:col-span-3' : 'md:col-span-3 lg:col-span-3';

                    return (
                      <Link
                        key={card.id}
                        href={meta.link}
                        className={`k-card k-card-glow group relative flex flex-col overflow-hidden p-7 ${span}`}
                        style={{ minHeight: 300 }}
                      >
                        {/* Arka ışık */}
                        <div
                          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[70px] transition-all duration-700 group-hover:scale-125"
                          style={{ background: 'rgba(255,106,26,0.14)' }}
                        />
                        <div className="k-grid-bg pointer-events-none absolute inset-0 opacity-60" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div
                            className="flex h-12 w-12 items-center justify-center rounded-[10px] transition-colors duration-300"
                            style={{ background: 'var(--k-surface-3)', border: '1px solid var(--k-line-2)' }}
                          >
                            <Icon size={22} strokeWidth={2} style={{ color: 'var(--k-hot)' }} />
                          </div>
                          <span className="k-chip">{card.tag}</span>
                        </div>

                        <h3 className="k-display relative mt-6 text-[24px]">{card.title}</h3>
                        <p
                          className="relative mt-3 text-[13.5px] leading-relaxed"
                          style={{ color: 'var(--k-ink-3)' }}
                        >
                          {card.description}
                        </p>

                        <div className="flex-1" />

                        <div
                          className="relative mt-6 flex items-end justify-between gap-4 pt-5"
                          style={{ borderTop: '1px solid var(--k-line)' }}
                        >
                          <div>
                            <div className="k-mono text-[30px] font-bold leading-none" style={{ color: 'var(--k-ink)' }}>
                              {card.stat}
                            </div>
                            <div className="k-label mt-1.5">{card.statLabel || 'Hızlı İşlem'}</div>
                          </div>
                          <span
                            className="k-mono inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-transform duration-300 group-hover:translate-x-1"
                            style={{ color: 'var(--k-hot)' }}
                          >
                            {(card.ctaText || 'BAŞLA').toLocaleUpperCase('tr-TR')}
                            <ArrowRight size={13} strokeWidth={2.5} />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT (SIDEBAR + GRID) ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-8 mt-6 pb-12 flex flex-col lg:flex-row gap-8 lg:gap-10">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 relative">
          <div className="sticky top-24 bg-[var(--k-surface)] rounded-xl border border-[var(--k-line)] p-4 shadow-sm">
            <SidebarContent />
          </div>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-[rgba(255,106,26,0.5)] backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-[var(--k-surface)] shadow-2xl overflow-y-auto px-5 py-6 transition-transform duration-300 transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
            <SidebarContent />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 min-w-0">

          {/* TOOLBAR */}
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
                {/* Gün İçi Teslim Toggle */}
                <button
                  onClick={handleSameDayToggle}
                  disabled={locationLoading}
                  title={sameDayMode ? 'Tüm Cihazlara Dön' : 'Yakınımdaki Mağazalar (Gün İçi Teslim)'}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all shadow-sm disabled:opacity-60 ${ sameDayMode ? 'bg-orange-500 border-orange-500 text-white shadow-orange-500/30 shadow-lg' : 'bg-[var(--k-surface)] border-[var(--k-line)] text-[var(--k-ink-2)] hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)]' }`}
                >
                  {locationLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <MapPin size={15} className={sameDayMode ? 'text-white' : 'text-orange-500'} />
                  }
                  <span className="hidden sm:inline">
                    {locationLoading ? 'Konum Alınıyor…' : sameDayMode ? 'Gün İçi Teslim' : 'Gün İçi Teslim'}
                  </span>
                  {/* Toggle pill */}
                  <div className={`relative w-9 h-5 rounded-full border transition-all duration-300 ${ sameDayMode ? 'bg-[rgba(28,21,18,0.45)] border-white/50' : 'bg-[var(--k-surface-3)] border-[var(--k-line-2)]' }`}>
                    <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full shadow transition-all duration-300 ${ sameDayMode ? 'left-[18px] bg-[var(--k-surface)]' : 'left-[2px] bg-[var(--k-surface)]' }`} />
                  </div>
                </button>
                {/* View Toggle */}
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

                {/* Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-[var(--k-surface)] border border-[var(--k-line)] rounded-xl text-sm font-bold text-[var(--k-ink)] hover:bg-[var(--k-hot-wash)] hover:border-[var(--k-line-hot)] transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={14} className="text-orange-500 mr-1" />
                    <span className="hidden sm:inline text-[var(--k-ink-3)] font-medium mr-1">Sırala:</span>
                    {activeSortLabel}
                    <ChevronDown size={16} className={`text-[var(--k-ink-4)] transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--k-surface)] border border-orange-100 rounded-2xl shadow-xl shadow-orange-500/10 z-50 p-2 animate-in fade-in slide-in-from-top-2">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setSortMode(option.id); setIsSortOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between mb-1 last:mb-0 ${ sortMode === option.id ? 'text-[var(--k-hot)] bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)]' : 'text-[var(--k-ink-2)] hover:bg-[var(--k-surface-2)] hover:text-[var(--k-ink)]' }`}
                        >
                          {option.label}
                          {sortMode === option.id && <Check size={16} strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Filter */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-2 pl-4 pr-3 py-2.5 bg-[var(--k-surface)] border border-[var(--k-line)] text-[var(--k-ink)] rounded-xl text-sm font-bold hover:bg-[var(--k-hot-wash)] hover:border-[var(--k-line-hot)] transition-all shadow-sm relative"
                >
                  <Filter size={16} />
                  <span>Filtreler</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* AKTİF FİLTRE ETİKETLERİ */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-[var(--k-ink-3)] mr-2 bg-[var(--k-surface)] px-2 py-1 rounded-lg shadow-sm border border-[var(--k-line)]">
                  Aktif Seçimler:
                </span>

                {selectedBrand && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--k-hot)] text-white rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand(null)} className="text-[var(--k-ink-4)] hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedGrade && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #C2410C, #F97316)', color: '#fff' }}>
                    Kozmetik: {selectedGrade}
                    <button onClick={() => setSelectedGrade(null)} className="text-orange-200 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedStorage && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #9A3412, #EA580C)', color: '#fff' }}>
                    {selectedStorage}
                    <button onClick={() => setSelectedStorage(null)} className="text-orange-200 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedColor && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff' }}>
                    {selectedColor}
                    <button onClick={() => setSelectedColor(null)} className="text-orange-100 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {warrantyOnly && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #166534, #16a34a)', color: '#fff' }}>
                    <ShieldCheck size={14} /> VIP Garantili
                    <button onClick={() => setWarrantyOnly(false)} className="text-green-200 hover:text-white transition-colors ml-1">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {(priceRange[0] > priceStats.min || priceRange[1] < priceStats.max) && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #7C2D12, #C2410C)', color: '#fff' }}>
                    ₺{priceRange[0].toLocaleString('tr-TR')} – ₺{priceRange[1].toLocaleString('tr-TR')}
                    <button onClick={() => setPriceRange([priceStats.min, priceStats.max])} className="text-orange-200 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* MODEL GRID (If selectedBrand is set and no searchQuery) */}
          {selectedBrand && !searchQuery && (
            <div className="mb-8 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-black text-[var(--k-ink-4)] uppercase tracking-widest mb-4 flex items-center gap-2">
                {selectedBrand} Modelleri
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {(() => {
                  const brandMenu = MENU_ITEMS.find(m => m.label === selectedBrand);
                  if (!brandMenu || !brandMenu.megaMenu) return null;
                  const models = brandMenu.megaMenu.flatMap(g => g.items);
                  const navbarModels = (configData?.settings as any)?.navbarModels || {};
                  
                  return models.map(item => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line)] hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center relative bg-[var(--k-surface-2)]">
                        {navbarModels[item.name] || (item as any).imageUrl ? (
                          <img src={navbarModels[item.name] || (item as any).imageUrl} alt={item.name}
                            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <span className="text-4xl font-black select-none pointer-events-none text-[var(--k-ink)]">
                            {selectedBrand.charAt(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-[var(--k-ink-2)] group-hover:text-orange-600 text-center leading-tight transition-colors line-clamp-2">
                        {item.name}
                      </p>
                    </Link>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* ÜRÜN GRIDI */}
          <div className="min-h-[600px]">
            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(Math.min(itemsPerPage, 8))].map((_, i) => <FamilyCardSkeleton key={i} />)}
              </div>
            )}

            {!isLoading && paginatedProducts.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((family: FamilySummary, index: number) => (
                  <div key={`${family.brand}-${family.model}`} className="relative animate-in fade-in slide-in-from-bottom-3 h-full"
                    style={{ animationDelay: `${Math.min(index * 35, 200)}ms` }}>
                    {sameDayMode && (
                      <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md shadow-orange-500/40 pointer-events-none">
                        <MapPin size={9} /> Bugün Teslim
                      </div>
                    )}
                    <FamilyCard family={family} index={index} />
                  </div>
                ))}
              </div>
            )}

            {/* Boş Durum */}
            {!isLoading && paginatedProducts.length === 0 && (
              <div className="relative flex flex-col items-center justify-center py-20 text-center bg-[var(--k-surface)] rounded-[14px] border border-dashed border-[var(--k-line-2)] animate-in fade-in overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'radial-gradient(circle at 50% 50%, rgba(249,115,22,0.05) 0%, transparent 65%)' }} />
                <div className="relative z-10 w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-orange-300/30 rounded-full animate-ping opacity-60" />
                  <div className="relative w-full h-full bg-[var(--k-surface)] rounded-full flex items-center justify-center shadow-lg border border-orange-200">
                    <Search size={32} className="text-orange-400" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="font-black text-2xl text-[var(--k-ink)] tracking-tight mb-3 relative z-10">
                  Aradığınız kriterlerde cihaz bulunamadı
                </h3>
                <p className="text-[var(--k-ink-2)] text-sm max-w-md mx-auto mb-10 font-medium relative z-10">
                  {sameDayMode
                    ? '100 km çevrenizde bu kriterlere uyan stok bulunamadı. Yarıçapı genişletmek için "Gün İçi Teslim" modunu kapatın.'
                    : activeFiltersCount > 0
                    ? 'Seçtiğiniz filtrelere uyan bir cihaz stoklarımızda görünmüyor. Lütfen filtreleri azaltın.'
                    : searchQuery
                    ? `"${searchQuery}" kelimesine uygun sonuç bulamadık.`
                    : 'Stoklar henüz güncellenmedi.'}
                </p>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="relative z-10 px-8 py-4 bg-orange-500 text-white font-bold text-sm rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/25 hover:-translate-y-0.5"
                  >
                    Tüm Filtreleri Sıfırla
                  </button>
                )}
              </div>
            )}

            {/* Sayfalama */}
            {!isLoading && filteredProducts.length > itemsPerPage && (
              <div className="flex items-center justify-center gap-2 mt-16 animate-in fade-in">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[var(--k-surface)] border border-[var(--k-line)] text-[var(--k-ink-2)] font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)] transition-all shadow-sm"
                >
                  Önceki
                </button>

                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl transition-all font-bold text-sm shadow-sm border ${ currentPage === pageNum ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-300/40' : 'bg-[var(--k-surface)] text-[var(--k-ink-2)] border-[var(--k-line)] hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)]' }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 7 && (
                  <>
                    <span className="text-[var(--k-ink-4)] font-black px-2 tracking-widest">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 rounded-xl bg-[var(--k-surface)] text-[var(--k-ink-2)] border border-[var(--k-line)] hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)] transition-all font-bold text-sm shadow-sm"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[var(--k-surface)] border border-[var(--k-line)] text-[var(--k-ink-2)] font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--k-line-hot)] hover:bg-[var(--k-hot-wash)] hover:text-[var(--k-hot)] transition-all shadow-sm"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER FADE REMOVED */}
    </div>
  );
}

export default function HomePageWrapper() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
