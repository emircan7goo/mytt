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
  Realme:  { active: '#7C3AED', text: '#ffffff', glow: 'rgba(234,88,12,0.25)'   },
  Tecno:   { active: '#0d9488', text: '#ffffff', glow: 'rgba(13,148,136,0.25)'  },
  Infinix: { active: '#16a34a', text: '#ffffff', glow: 'rgba(22,163,74,0.25)'   },
};

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
    gradient:    'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 100%)',
    badgeCls:    'bg-violet-500/10 text-violet-500 border border-violet-500/20',
    link:        '/sell',
    iconBg:      'bg-violet-50',
    iconColor:   'text-violet-600',
    borderColor: 'group-hover:border-violet-500/30',
    glowColor:   'rgba(16,185,129,0.15)',
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
    <div className="h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent my-6" />
  );

  // ── Sidebar ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col pb-8">
      {/* Mobile header */}
      <div className="flex items-center justify-between lg:hidden mb-6 px-2">
        <h3 className="font-black text-2xl text-slate-900">Filtreler</h3>
        <button onClick={() => setShowMobileFilters(false)}
                className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      {activeFiltersCount > 0 && (
        <div className="lg:hidden flex items-center justify-between mb-4 px-2">
          <span className="text-sm font-semibold text-slate-500">{activeFiltersCount} filtre aktif</span>
          <button onClick={resetFilters}
                  className="text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200">
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
          className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition-all"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={16} />
        </div>
      </div>

      {/* Marka */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">Marka</span>
        </div>
        <div className="p-3 bg-white space-y-2">
          {brands.map(brand => {
            const isActive = selectedBrand === brand;
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(isActive ? null : brand)}
                className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {brand}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kozmetik Durum */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">Kozmetik Durum</span>
        </div>
        <div className="p-3 bg-white space-y-2">
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
                  isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {grade} <span className="text-[10px] text-slate-400 font-normal">({gd.label})</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kapasite */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">Kapasite</span>
        </div>
        <div className="p-3 bg-white space-y-2">
          {storages.map(storage => {
            const isActive = selectedStorage === storage;
            return (
              <button
                key={storage}
                onClick={() => setSelectedStorage(isActive ? null : storage)}
                className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {storage}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renk */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">Renk</span>
        </div>
        <div className="p-3 bg-white max-h-40 overflow-y-auto space-y-2">
          {colors.map(color => {
            const isActive = selectedColor === color;
            return (
              <button
                key={color}
                onClick={() => setSelectedColor(isActive ? null : color)}
                className="flex items-center gap-2.5 w-full text-left py-0.5 text-xs group"
              >
                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
                }`}>
                  {isActive && <Check size={12} strokeWidth={3} />}
                </div>
                <span className={`transition-colors ${isActive ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  {color}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fiyat */}
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-700">Fiyat (TL)</span>
        </div>
        <div className="p-3 bg-white">
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
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-blue-500"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="number"
              value={localMax}
              onChange={e => handleMax(e.target.value)}
              onBlur={e => {
                const n = Number(e.target.value);
                if (!isNaN(n)) setPriceRange([priceRange[0], n]);
              }}
              placeholder="Max"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-800 outline-none focus:border-blue-500"
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
                    isActive ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
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
      <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
        <div className="p-3 bg-white">
          <button
            onClick={() => setWarrantyOnly(!warrantyOnly)}
            className="flex items-center gap-2.5 w-full text-left py-1 text-xs group"
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
              warrantyOnly ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white group-hover:border-slate-400'
            }`}>
              {warrantyOnly && <Check size={12} strokeWidth={3} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs transition-colors ${warrantyOnly ? 'font-bold text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                VIP Garantili Cihazlar
              </span>
              <span className="text-[9px] text-slate-400">Sadece garantili ürünleri filtrele</span>
            </div>
          </button>
        </div>
      </div>

      {activeFiltersCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full py-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition-colors border border-rose-200 flex items-center justify-center gap-1.5"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  // ── Page ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-violet-500 selection:text-white">



      {/* ── HERO SLIDER ── */}
      <div className="relative z-10">
        {!searchQuery && showHero && (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 mt-6">
            <HeroSlider />
          </div>
        )}
      </div>

      {/* ── ÖNE ÇIKAN HİZMETLER ── */}
      <div className="relative z-10">
        {!searchQuery && (
          <div className="max-w-[1440px] mx-auto px-4 lg:px-8 mt-8 mb-4">
            {/* INJECTING CUSTOM WOW STYLES FOR APPLE/AIRBNB GLASS AESTHETIC */}
            <style>{`
              @keyframes blobBounce {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(40px, -60px) scale(1.15); }
                66% { transform: translate(-30px, 30px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
              }
              .wow-blob {
                animation: blobBounce 12s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
              }
              .wow-blob-reverse {
                animation: blobBounce 15s infinite alternate-reverse cubic-bezier(0.4, 0, 0.2, 1);
              }
              
              .glass-card-wow {
                background: rgba(255, 255, 255, 0.65);
                backdrop-filter: blur(28px);
                -webkit-backdrop-filter: blur(28px);
                border: 1px solid rgba(255, 255, 255, 0.9);
                box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1);
                transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
              }
              
              .glass-card-wow:hover {
                background: rgba(255, 255, 255, 0.95);
                transform: translateY(-8px) scale(1.02);
                box-shadow: 0 30px 60px -15px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,1);
              }
              
              .glass-card-wow:hover .wow-icon-bounce {
                animation: iconPop 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              }
              
              @keyframes iconPop {
                0% { transform: scale(1) rotate(0deg); }
                40% { transform: scale(1.3) rotate(-12deg); }
                70% { transform: scale(0.95) rotate(5deg); }
                100% { transform: scale(1.15) rotate(0deg); }
              }

              .wow-stat-text {
                background-size: 200% auto;
                animation: shineText 4s linear infinite;
              }
              
              @keyframes shineText {
                to { background-position: 200% center; }
              }
            `}</style>

            <ScrollReveal className="rounded-[3rem] bg-slate-50/50 p-6 lg:p-10 relative overflow-hidden border border-slate-100 shadow-[inset_0_0_100px_rgba(0,0,0,0.02)]">
              {/* Dynamic Abstract Background Blobs */}
              <div className="absolute -top-20 -left-20 w-[32rem] h-[32rem] bg-violet-200/50 rounded-full blur-[100px] wow-blob pointer-events-none" />
              <div className="absolute -bottom-32 -right-20 w-[35rem] h-[35rem] bg-blue-200/50 rounded-full blur-[100px] wow-blob-reverse pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-amber-100/40 rounded-full blur-[100px] wow-blob pointer-events-none" />
              
              {/* Grid pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

              {/* Bölüm başlığı */}
              <div className="relative z-10 mb-8 flex flex-col items-center text-center">
                {/* Removed Premium Deneyim tag per user request */}
                <h2 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 drop-shadow-sm">Ne Yapmak İstersiniz?</h2>
                <p className="text-slate-500 text-base font-medium mt-3 max-w-lg mx-auto">Satın al, sat, takas yap — hepsi bir arada. Yepyeni bir teknoloji alışverişi deneyimine hazır olun.</p>
              </div>

              {/* 3 Kart Grid */}
              {(() => {
                const cards = (configDataSettings?.featureCards ?? DEFAULT_FEATURE_CARDS)
                  .filter(c => c.enabled !== false);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
                    {cards.map(card => {
                      const meta = CARD_META[card.id];
                      if (!meta) return null;
                      
                      const isSell = card.id === 'sell';
                      const isAI = card.id === 'ai-finder';
                      
                      // Stat text gradient mapping
                      const gradText = isSell 
                        ? 'bg-gradient-to-r from-violet-600 via-violet-500 to-violet-600 text-transparent bg-clip-text' 
                        : isAI 
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 text-transparent bg-clip-text' 
                          : 'bg-gradient-to-r from-amber-500 via-violet-500 to-amber-500 text-transparent bg-clip-text';

                      // Minimalist but bold colors for tags and icons
                      const iconColor = isSell ? 'text-violet-600 bg-violet-50' : isAI ? 'text-blue-600 bg-blue-50' : 'text-amber-600 bg-amber-50';
                      const tagColor = isSell ? 'bg-violet-100 text-violet-700' : isAI ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700';
                      const btnColor = isSell ? 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30' : isAI ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30';

                      return (
                        <Link key={card.id} href={meta.link}
                              className="group flex flex-col rounded-[2.5rem] overflow-hidden glass-card-wow relative min-h-[460px]"
                        >
                          {/* VISUAL STAGE (Görsel Alan) */}
                          <div className={`h-56 relative w-full overflow-hidden flex items-center justify-center ${isSell ? 'bg-violet-50/50' : isAI ? 'bg-blue-50/50' : 'bg-amber-50/50'}`}>
                            {/* Futuristic Background Grid */}
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]" />
                            
                            {/* Massive Glowing CSS Orb (The "Visual") */}
                            <div className={`absolute w-32 h-32 rounded-full blur-2xl opacity-60 group-hover:scale-150 transition-transform duration-1000 ${isSell ? 'bg-violet-400' : isAI ? 'bg-blue-400' : 'bg-amber-400'}`} />
                            <div className={`absolute w-24 h-24 rounded-full blur-xl opacity-80 mix-blend-overlay ${isSell ? 'bg-violet-300' : isAI ? 'bg-indigo-300' : 'bg-violet-300'} wow-blob`} />

                            {/* Center Glass Pill containing the Icon */}
                            <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/80 shadow-2xl flex items-center justify-center wow-icon-bounce">
                              {/* Inner Glow */}
                              <div className="absolute inset-0 rounded-[2rem] shadow-[inset_0_0_20px_rgba(255,255,255,1)] pointer-events-none" />
                              
                              <div className={`transform group-hover:scale-110 transition-transform duration-500 drop-shadow-xl ${iconColor.split(' ')[0]}`}>
                                {card.id === 'sell'      && <Smartphone size={44} strokeWidth={2} />}
                                {card.id === 'ai-finder' && <Brain size={44} strokeWidth={2} />}
                                {card.id === 'trade-in'  && <RefreshCcw size={44} strokeWidth={2} />}
                              </div>
                            </div>
                            
                            {/* Floating Tag over the image */}
                            <div className="absolute top-5 right-5 z-20">
                              <span className={`text-[9px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full shadow-sm ${tagColor} bg-white/90 backdrop-blur-md`}>
                                {card.tag}
                              </span>
                            </div>
                          </div>

                          {/* TEXT & ACTION (İçerik Alanı) */}
                          <div className="p-8 flex flex-col flex-1 bg-white/60">
                            {/* Titles */}
                            <div className="flex flex-col mb-auto">
                              <h3 className="text-2xl font-black tracking-tighter text-slate-900 group-hover:text-black transition-colors">
                                {card.title}
                              </h3>
                              <p className="text-sm text-slate-500 leading-relaxed font-medium mt-2.5">
                                {card.description}
                              </p>
                            </div>

                            {/* Divider & Bottom Action */}
                            <div className="flex-1 flex flex-col justify-end pt-6">
                              <div className="w-full h-[1px] bg-gradient-to-r from-slate-200 via-slate-100 to-transparent mb-5" />
                              
                              <div className="flex items-end justify-between">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">
                                    {card.statLabel || 'Hızlı İşlem'}
                                  </span>
                                  <span className={`text-4xl font-black tracking-tighter leading-none wow-stat-text ${gradText}`}>
                                    {card.stat}
                                  </span>
                                </div>
                                
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-white shadow-xl transition-all duration-500 group-hover:w-32 group-hover:px-4 ${btnColor}`}>
                                  <span className="hidden group-hover:inline-block font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mr-2">
                                    {card.ctaText}
                                  </span>
                                  <ArrowRight size={20} strokeWidth={2.5} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </div>
                            </div>

                          </div>
                        </Link>
                      );
                    })}
                  </div>
                );
              })()}
            </ScrollReveal>
          </div>
        )}
      </div>

      {/* ── MAIN CONTENT (SIDEBAR + GRID) ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 lg:px-8 mt-6 pb-24 flex flex-col lg:flex-row gap-8 lg:gap-10">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden lg:block w-[280px] flex-shrink-0 relative">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <SidebarContent />
          </div>
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        <div className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${showMobileFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto px-5 py-6 transition-transform duration-300 transform ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}`}>
            <SidebarContent />
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex-1 min-w-0">

          {/* TOOLBAR */}
          <div className="sticky top-[80px] z-40 mb-6">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg tracking-tight text-slate-900">
                  {sameDayMode
                    ? '🚀 Gün İçi Teslim'
                    : searchQuery
                      ? `"${searchQuery}" Sonuçları`
                      : 'Tüm Cihazlar'}
                </h2>
                {!isLoading && (
                  <span className="inline-flex items-center text-xs font-medium text-slate-500 mt-0.5">
                    <b className="text-blue-600 mr-1">{filteredProducts.length}</b>
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all shadow-sm disabled:opacity-60 ${ sameDayMode ? 'bg-violet-500 border-violet-500 text-white shadow-violet-500/30 shadow-lg' : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700' }`}
                >
                  {locationLoading
                    ? <Loader2 size={15} className="animate-spin" />
                    : <MapPin size={15} className={sameDayMode ? 'text-white' : 'text-violet-500'} />
                  }
                  <span className="hidden sm:inline">
                    {locationLoading ? 'Konum Alınıyor…' : sameDayMode ? 'Gün İçi Teslim' : 'Gün İçi Teslim'}
                  </span>
                  {/* Toggle pill */}
                  <div className={`relative w-9 h-5 rounded-full border transition-all duration-300 ${ sameDayMode ? 'bg-white/30 border-white/50' : 'bg-slate-200 border-slate-300' }`}>
                    <div className={`absolute top-[2px] w-[14px] h-[14px] rounded-full shadow transition-all duration-300 ${ sameDayMode ? 'left-[18px] bg-white' : 'left-[2px] bg-white' }`} />
                  </div>
                </button>
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    <Grid3X3 size={18} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-700'}`}
                  >
                    <List size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center gap-2 pl-4 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm"
                  >
                    <SlidersHorizontal size={14} className="text-violet-500 mr-1" />
                    <span className="hidden sm:inline text-slate-500 font-medium mr-1">Sırala:</span>
                    {activeSortLabel}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSortOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-violet-100 rounded-2xl shadow-xl shadow-violet-500/10 z-50 p-2 animate-in fade-in slide-in-from-top-2">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => { setSortMode(option.id); setIsSortOpen(false); setCurrentPage(1); }}
                          className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-between mb-1 last:mb-0 ${ sortMode === option.id ? 'text-violet-700 bg-violet-50 border border-violet-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' }`}
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
                  className="lg:hidden flex items-center gap-2 pl-4 pr-3 py-2.5 bg-white border border-slate-200 text-slate-900 rounded-xl text-sm font-bold hover:bg-violet-50 hover:border-violet-300 transition-all shadow-sm relative"
                >
                  <Filter size={16} />
                  <span>Filtreler</span>
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-violet-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* AKTİF FİLTRE ETİKETLERİ */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4 animate-in fade-in slide-in-from-top-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 mr-2 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200">
                  Aktif Seçimler:
                </span>

                {selectedBrand && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand(null)} className="text-slate-400 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedGrade && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #6D28D9, #8B5CF6)', color: '#fff' }}>
                    Kozmetik: {selectedGrade}
                    <button onClick={() => setSelectedGrade(null)} className="text-violet-200 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedStorage && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #5B21B6, #7C3AED)', color: '#fff' }}>
                    {selectedStorage}
                    <button onClick={() => setSelectedStorage(null)} className="text-violet-200 hover:text-white transition-colors">
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                )}
                {selectedColor && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)', color: '#fff' }}>
                    {selectedColor}
                    <button onClick={() => setSelectedColor(null)} className="text-violet-100 hover:text-white transition-colors">
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
                        style={{ background: 'linear-gradient(135deg, #4C1D95, #6D28D9)', color: '#fff' }}>
                    ₺{priceRange[0].toLocaleString('tr-TR')} – ₺{priceRange[1].toLocaleString('tr-TR')}
                    <button onClick={() => setPriceRange([priceStats.min, priceStats.max])} className="text-violet-200 hover:text-white transition-colors">
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
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
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
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center relative bg-slate-50">
                        {navbarModels[item.name] || (item as any).imageUrl ? (
                          <img src={navbarModels[item.name] || (item as any).imageUrl} alt={item.name}
                            className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200" />
                        ) : (
                          <span className="text-4xl font-black select-none pointer-events-none text-slate-100">
                            {selectedBrand.charAt(0)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-slate-600 group-hover:text-violet-600 text-center leading-tight transition-colors line-clamp-2">
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
                      <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-violet-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md shadow-violet-500/40 pointer-events-none">
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
              <div className="relative flex flex-col items-center justify-center py-20 text-center bg-violet-50/60 rounded-[2rem] border-2 border-dashed border-violet-200 shadow-sm animate-in fade-in overflow-hidden">
                <div className="absolute inset-0 pointer-events-none"
                     style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 65%)' }} />
                <div className="relative z-10 w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-violet-300/30 rounded-full animate-ping opacity-60" />
                  <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border border-violet-200">
                    <Search size={32} className="text-violet-400" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="font-black text-2xl text-slate-900 tracking-tight mb-3 relative z-10">
                  Aradığınız kriterlerde cihaz bulunamadı
                </h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto mb-10 font-medium relative z-10">
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
                    className="relative z-10 px-8 py-4 bg-violet-500 text-white font-bold text-sm rounded-2xl hover:bg-violet-600 transition-all shadow-xl shadow-violet-500/25 hover:-translate-y-0.5"
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
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm"
                >
                  Önceki
                </button>

                {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl transition-all font-bold text-sm shadow-sm border ${ currentPage === pageNum ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-300/40' : 'bg-white text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700' }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 7 && (
                  <>
                    <span className="text-slate-400 font-black px-2 tracking-widest">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-10 h-10 rounded-xl bg-white text-slate-700 border border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all font-bold text-sm shadow-sm"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all shadow-sm"
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
