'use client';

import {
  Search, ShoppingCart, User, ChevronDown, LogOut,
  LayoutGrid, Settings, Menu, X, Heart, Phone, Store,
  ChevronRight, Zap, Smartphone, Apple, Tablet, Package,
  Grid3x3, Moon, Sun,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { ROLE_DASHBOARD } from '@/lib/auth';

export const MENU_ITEMS = [
  { label: 'Tüm Cihazlar', value: null, href: '/', icon: Grid3x3 },
  {
    label: 'iPhone',
    value: 'Apple',
    href: '/?cat=Apple',
    icon: Apple,
    megaMenu: [
      {
        title: 'iPhone 17 Serisi',
        items: [
          { name: 'iPhone 17 Pro Max', href: '/?cat=Apple&q=iPhone+17+Pro+Max' },
          { name: 'iPhone 17 Pro',     href: '/?cat=Apple&q=iPhone+17+Pro' },
          { name: 'iPhone 17 Plus',    href: '/?cat=Apple&q=iPhone+17+Plus' },
          { name: 'iPhone 17',         href: '/?cat=Apple&q=iPhone+17' },
        ]
      },
      {
        title: 'iPhone 16 Serisi',
        items: [
          { name: 'iPhone 16 Pro Max', href: '/?cat=Apple&q=iPhone+16+Pro+Max' },
          { name: 'iPhone 16 Pro',     href: '/?cat=Apple&q=iPhone+16+Pro' },
          { name: 'iPhone 16 Plus',    href: '/?cat=Apple&q=iPhone+16+Plus' },
          { name: 'iPhone 16',         href: '/?cat=Apple&q=iPhone+16' },
          { name: 'iPhone 16e',        href: '/?cat=Apple&q=iPhone+16e' },
        ]
      },
      {
        title: 'iPhone 15 Serisi',
        items: [
          { name: 'iPhone 15 Pro Max', href: '/?cat=Apple&q=iPhone+15+Pro+Max' },
          { name: 'iPhone 15 Pro',     href: '/?cat=Apple&q=iPhone+15+Pro' },
          { name: 'iPhone 15 Plus',    href: '/?cat=Apple&q=iPhone+15+Plus' },
          { name: 'iPhone 15',         href: '/?cat=Apple&q=iPhone+15' },
        ]
      },
      {
        title: 'iPhone 14 Serisi',
        items: [
          { name: 'iPhone 14 Pro Max', href: '/?cat=Apple&q=iPhone+14+Pro+Max' },
          { name: 'iPhone 14 Pro',     href: '/?cat=Apple&q=iPhone+14+Pro' },
          { name: 'iPhone 14 Plus',    href: '/?cat=Apple&q=iPhone+14+Plus' },
          { name: 'iPhone 14',         href: '/?cat=Apple&q=iPhone+14' },
        ]
      },
      {
        title: 'iPhone 13 Serisi',
        items: [
          { name: 'iPhone 13 Pro Max', href: '/?cat=Apple&q=iPhone+13+Pro+Max' },
          { name: 'iPhone 13 Pro',     href: '/?cat=Apple&q=iPhone+13+Pro' },
          { name: 'iPhone 13 mini',    href: '/?cat=Apple&q=iPhone+13+mini' },
          { name: 'iPhone 13',         href: '/?cat=Apple&q=iPhone+13' },
        ]
      },
      {
        title: 'Klasikler & SE',
        items: [
          { name: 'iPhone 12 Serisi',  href: '/?cat=Apple&q=iPhone+12' },
          { name: 'iPhone 11 Serisi',  href: '/?cat=Apple&q=iPhone+11' },
          { name: 'iPhone X Serisi',   href: '/?cat=Apple&q=iPhone+X' },
          { name: 'iPhone SE',         href: '/?cat=Apple&q=iPhone+SE' },
          { name: 'Tüm Apple',         href: '/?cat=Apple' },
        ]
      }
    ]
  },
  {
    label: 'Samsung',
    value: 'Samsung',
    href: '/?cat=Samsung',
    icon: Smartphone,
    megaMenu: [
      {
        title: 'Galaxy S25 Serisi',
        items: [
          { name: 'Galaxy S25 Ultra',  href: '/?cat=Samsung&q=S25+Ultra' },
          { name: 'Galaxy S25+',       href: '/?cat=Samsung&q=S25+Plus' },
          { name: 'Galaxy S25',        href: '/?cat=Samsung&q=Galaxy+S25' },
        ]
      },
      {
        title: 'Galaxy S24 Serisi',
        items: [
          { name: 'Galaxy S24 Ultra',  href: '/?cat=Samsung&q=S24+Ultra' },
          { name: 'Galaxy S24+',       href: '/?cat=Samsung&q=S24+Plus' },
          { name: 'Galaxy S24 FE',     href: '/?cat=Samsung&q=S24+FE' },
          { name: 'Galaxy S24',        href: '/?cat=Samsung&q=Galaxy+S24' },
        ]
      },
      {
        title: 'Galaxy S23 Serisi',
        items: [
          { name: 'Galaxy S23 Ultra',  href: '/?cat=Samsung&q=S23+Ultra' },
          { name: 'Galaxy S23+',       href: '/?cat=Samsung&q=S23+Plus' },
          { name: 'Galaxy S23 FE',     href: '/?cat=Samsung&q=S23+FE' },
          { name: 'Galaxy S23',        href: '/?cat=Samsung&q=Galaxy+S23' },
        ]
      },
      {
        title: 'Galaxy Z Serisi',
        items: [
          { name: 'Galaxy Z Fold 6',   href: '/?cat=Samsung&q=Z+Fold+6' },
          { name: 'Galaxy Z Fold 5',   href: '/?cat=Samsung&q=Z+Fold+5' },
          { name: 'Galaxy Z Flip 6',   href: '/?cat=Samsung&q=Z+Flip+6' },
          { name: 'Galaxy Z Flip 5',   href: '/?cat=Samsung&q=Z+Flip+5' },
        ]
      },
      {
        title: 'Galaxy A Serisi',
        items: [
          { name: 'Galaxy A56',        href: '/?cat=Samsung&q=A56' },
          { name: 'Galaxy A55',        href: '/?cat=Samsung&q=A55' },
          { name: 'Galaxy A36',        href: '/?cat=Samsung&q=A36' },
          { name: 'Galaxy A35',        href: '/?cat=Samsung&q=A35' },
          { name: 'Tüm Samsung',       href: '/?cat=Samsung' },
        ]
      }
    ]
  },
  {
    label: 'Xiaomi',
    value: 'Xiaomi',
    href: '/?cat=Xiaomi',
    icon: Smartphone,
    megaMenu: [
      {
        title: 'Xiaomi 15 Serisi',
        items: [
          { name: 'Xiaomi 15 Ultra',   href: '/?cat=Xiaomi&q=Xiaomi+15+Ultra' },
          { name: 'Xiaomi 15 Pro',     href: '/?cat=Xiaomi&q=Xiaomi+15+Pro' },
          { name: 'Xiaomi 15',         href: '/?cat=Xiaomi&q=Xiaomi+15' },
        ]
      },
      {
        title: 'Xiaomi 14 Serisi',
        items: [
          { name: 'Xiaomi 14 Ultra',   href: '/?cat=Xiaomi&q=Xiaomi+14+Ultra' },
          { name: 'Xiaomi 14 Pro',     href: '/?cat=Xiaomi&q=Xiaomi+14+Pro' },
          { name: 'Xiaomi 14T Pro',    href: '/?cat=Xiaomi&q=Xiaomi+14T+Pro' },
          { name: 'Xiaomi 14',         href: '/?cat=Xiaomi&q=Xiaomi+14' },
        ]
      },
      {
        title: 'Redmi Serisi',
        items: [
          { name: 'Redmi Note 14 Pro+',href: '/?cat=Xiaomi&q=Redmi+Note+14+Pro%2B' },
          { name: 'Redmi Note 14 Pro', href: '/?cat=Xiaomi&q=Redmi+Note+14+Pro' },
          { name: 'Redmi Note 14',     href: '/?cat=Xiaomi&q=Redmi+Note+14' },
          { name: 'Redmi Note 13 Pro', href: '/?cat=Xiaomi&q=Redmi+Note+13+Pro' },
        ]
      },
      {
        title: 'POCO Serisi',
        items: [
          { name: 'POCO X7 Pro',       href: '/?cat=Xiaomi&q=POCO+X7+Pro' },
          { name: 'POCO X7',           href: '/?cat=Xiaomi&q=POCO+X7' },
          { name: 'POCO F6 Pro',       href: '/?cat=Xiaomi&q=POCO+F6+Pro' },
          { name: 'Tüm Xiaomi',        href: '/?cat=Xiaomi' },
        ]
      }
    ]
  },
  { label: 'Tabletler',    value: 'Tabletler',    href: '/?cat=Tabletler',    icon: Tablet },
  { label: 'Aksesuarlar',  value: 'Aksesuarlar',  href: '/?cat=Aksesuarlar',  icon: Package },
];

export default function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [showMobileMenu, setShowMobileMenu]   = useState(false);
  const [searchValue, setSearchValue]         = useState('');
  const [mounted, setMounted]                 = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchParams   = useSearchParams();
  const router         = useRouter();
  const activeCategory = searchParams?.get('cat') || null;

  const { cartCount, user, logout, setShowAuthModal, openCart, setSearchQuery } = useApp();
  const { data: configData } = useSiteConfig();
  const navbarModels = (configData?.settings as any)?.navbarModels || {};

  useEffect(() => {
    setMounted(true);
    // Ensure light mode is always the default — clear any saved dark mode preference
    localStorage.setItem('mytt-dark-mode', '0');
    document.documentElement.removeAttribute('data-theme');
    setDarkMode(false);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('mytt-dark-mode', '1');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('mytt-dark-mode', '0');
    }
  };

  // Ctrl+K / Cmd+K → open fullscreen search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!profileMenuRef.current?.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 80);
  }, [showSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchValue);
    setShowSearch(false);
  };

  const handleLogout = useCallback(async () => {
    logout();
    setShowProfileMenu(false);
    toast.success('Güvenli çıkış yapıldı.');
  }, [logout]);

  return (
    <>
      <header 
        className={`sticky z-[50] transition-shadow duration-300 ${
          scrolled 
            ? 'top-0 w-full bg-white shadow-md border-b border-slate-100' 
            : 'top-0 w-full bg-white border-b border-slate-100'
        }`}
      >
        {/* ── Ana Çubuk ───────────────────────────────────────────────────── */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-8 h-[64px] flex items-center gap-3">

          {/* Hamburger (mobil) */}
          <button
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all"
            onClick={() => setShowMobileMenu(true)}
            aria-label="Menüyü aç"
          >
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group mr-6">
            <img 
              src="/logo.png" 
              alt="Mytt" 
              className={`h-16 sm:h-20 w-auto object-contain scale-125 sm:scale-150 origin-left transition-transform duration-300 group-hover:scale-[1.3] sm:group-hover:scale-[1.55] dark:invert ${darkMode ? 'invert brightness-0' : ''}`} 
            />
          </Link>

          {/* Arama (masaüstü) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-[600px] ml-4">
            <div className="flex items-center w-full h-[46px] rounded-2xl bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white focus-within:shadow-[0_4px_20px_rgba(234,88,12,0.06)] transition-all overflow-hidden px-2">
              <Search size={18} className="text-slate-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Marka, model veya kategori ara..."
                className="flex-1 px-4 text-[14px] text-slate-800 placeholder:text-slate-400 bg-transparent outline-none min-w-0"
              />
              <div className="hidden lg:flex items-center mr-2 flex-shrink-0">
                <kbd className="text-[10px] font-mono bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 text-slate-400 select-none">⌘K</kbd>
              </div>
              <button
                type="submit"
                className="h-[34px] px-5 rounded-xl bg-[var(--brand)] text-white text-[13px] font-bold mr-1 flex-shrink-0 hover:bg-[var(--brand-hover)] active:scale-95 transition-all shadow-md"
              >
                Ara
              </button>
            </div>
          </form>

          {/* Sağ aksiyonlar */}
          <div className="flex items-center gap-1.5 ml-auto">

            {/* Cihazını Sat CTA */}
            <Link
              href="/sell"
              className="hidden md:flex items-center gap-1.5 h-9 px-4 rounded-full text-[12px] font-bold bg-slate-900 text-white shadow-sm conic-glow-button"
            >
              <Smartphone size={13} className="relative z-10" />
              <span className="relative z-10 text-white group-hover:text-orange-900 mix-blend-difference">Cihazını Sat</span>
            </Link>

            {/* Mobil arama */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--ink-8)] transition-colors"
              onClick={() => setShowSearch(true)}
              aria-label="Ara"
            >
              <Search size={18} className="text-[var(--ink-3)]" />
            </button>



            {/* Auth / Profil */}
            {mounted && user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 h-9 px-2.5 rounded-xl hover:bg-[var(--ink-8)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shadow-sm ring-2 ring-white/80">
                    <span className="text-[11px] font-[800] text-white uppercase">
                      {(user.name || user.email).charAt(0)}
                    </span>
                  </div>
                  <span className="hidden md:block text-[13px] font-[500] text-[var(--ink-2)] max-w-[80px] truncate">
                    {user.name || user.email.split('@')[0]}
                  </span>
                  <ChevronDown size={12} className={`hidden md:block text-[var(--ink-4)] transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-[224px] bg-white rounded-2xl border border-[var(--ink-7)] shadow-[0_8px_40px_rgba(0,0,0,0.14)] z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Kullanıcı başlığı */}
                    <div className="px-4 py-3.5 bg-gradient-to-br from-[var(--brand-light)] to-white border-b border-[var(--ink-7)]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shadow-sm">
                          <span className="text-[12px] font-[800] text-white uppercase">
                            {(user.name || user.email).charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] font-[700] text-[var(--brand-deep)] uppercase tracking-wide leading-none">
                            {user.role === 'admin' ? 'Sistem Yöneticisi' : user.role === 'dealer' ? 'Bayi' : 'Müşteri'}
                          </p>
                          <p className="text-[13px] font-[600] text-[var(--ink)] mt-0.5 truncate">{user.name}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5">
                      {(user.role === 'admin' || user.role === 'dealer') && (
                        <Link
                          href={user.role === 'admin' ? '/admin/dashboard' : '/dealer/dashboard'}
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-[500] text-[var(--ink-2)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-deep)] transition-colors group"
                        >
                          <LayoutGrid size={14} className="text-[var(--brand)]" />
                          Yönetim Paneli
                          <ChevronRight size={11} className="ml-auto text-[var(--ink-5)]" />
                        </Link>
                      )}
                      <Link
                        href="/hesabim"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-[500] text-[var(--ink-2)] hover:bg-[var(--ink-8)] transition-colors"
                      >
                        <Settings size={14} className="text-[var(--ink-4)]" />
                        Hesap Ayarları
                      </Link>
                      <div className="h-px bg-[var(--ink-7)] my-1 mx-2" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-[500] text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : mounted ? (
              <>
                <Link
                  href="/register"
                  className="hidden sm:flex items-center h-[36px] px-3 text-[13px] font-[600] text-[var(--ink-2)] hover:text-[var(--brand-deep)] transition-colors rounded-xl hover:bg-[var(--ink-8)]"
                >
                  Üye Ol
                </Link>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 h-[36px] px-4 rounded-xl bg-[var(--brand)] text-white text-[13px] font-[600] hover:bg-[var(--brand-deep)] active:scale-95 transition-all shadow-[0_2px_8px_rgba(0,122,255,0.25)]"
                >
                  <User size={14} />
                  <span className="hidden sm:inline">Giriş Yap</span>
                </button>
              </>
            ) : null}

            {/* Sepet */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--ink-8)] transition-colors"
              aria-label="Sepet"
            >
              <ShoppingCart size={18} className="text-[var(--ink-3)]" />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[var(--brand)] text-white rounded-full text-[10px] font-[700] flex items-center justify-center leading-none shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Kategori Çubuğu & Mega Menü ────────────────────────────────────────── */}
        <div 
          className="border-t border-slate-100 bg-white relative"
          onMouseLeave={() => setHoveredCategory(null)}
        >
          <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
            <nav className="flex items-center gap-0.5 h-[48px] relative">
              {MENU_ITEMS.map((cat) => {
                const isActive = activeCategory === cat.value || (cat.value === null && !activeCategory);
                const isHovered = hoveredCategory === cat.label;
                return (
                  <div key={cat.label} className="h-full flex items-center flex-shrink-0 relative">
                    <Link
                      href={cat.href}
                      onMouseEnter={() => setHoveredCategory(cat.label)}
                      className={`relative flex items-center gap-1.5 px-4 h-full text-[13px] whitespace-nowrap font-semibold transition-colors duration-150 ${
                        isActive
                          ? 'text-orange-700'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}
                      {cat.megaMenu && (
                        <ChevronDown size={12} className={`transition-transform duration-200 ${isHovered ? 'rotate-180' : ''} ${isActive ? 'text-orange-600' : 'text-slate-400'}`} />
                      )}
                      {/* Active underline */}
                      {isActive && (
                        <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-orange-600 rounded-full" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* ── Mega Menü Dropdown ────────────────────────────────────────── */}
          {MENU_ITEMS.map((cat) => (
            cat.megaMenu && hoveredCategory === cat.label && (
              <div
                key={`${cat.label}-mega`}
                className="mega-menu-enter absolute left-0 right-0 top-[54px] overflow-hidden z-50"
                style={{ background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(0,0,0,0.04)' }}
              >
                <div className="max-w-[1000px] mx-auto px-6 py-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    {cat.megaMenu.map((group, i) => (
                      <div key={i} className="flex flex-col">
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">{group.title}</p>
                        <div className="flex flex-col space-y-2.5">
                          {group.items.map((item, j) => (
                            <Link key={j} href={item.href} onClick={() => setHoveredCategory(null)}
                              className="text-[14px] font-medium text-slate-700 hover:text-orange-600 transition-colors w-max">
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tüm marka CTA */}
                  <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
                    <Link
                      href={cat.href}
                      onClick={() => setHoveredCategory(null)}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-orange-600 hover:text-orange-700 hover:translate-x-1 transition-all"
                    >
                      Tüm {cat.label} Modelleri
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      </header>

      {/* ── Mega Menü Backdrop ─────────────────────────────────────────── */}
      {hoveredCategory && MENU_ITEMS.some(c => c.label === hoveredCategory && c.megaMenu) && (
        <div
          className="mega-backdrop fixed inset-0 z-[45] pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.42)', backdropFilter: 'blur(2px)' }}
          onClick={() => setHoveredCategory(null)}
        />
      )}

      {/* ── Tam Ekran Arama ─────────────────────────────────────────────── */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[var(--bg)]/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="max-w-[680px] w-full mx-auto px-4 pt-16 relative">
            <button
              onClick={() => setShowSearch(false)}
              className="absolute right-4 top-4 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--ink-8)] text-[var(--ink-3)] hover:bg-[var(--ink-7)] hover:text-[var(--ink)] transition-colors"
            >
              <X size={18} />
            </button>
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--ink-6)] focus-within:border-[var(--brand)] transition-colors">
                <Search size={24} className="text-[var(--ink-5)] flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Ne arıyorsunuz?"
                  className="flex-1 text-[28px] font-[family-name:var(--font-display)] font-[700] text-[var(--ink)] placeholder:text-[var(--ink-6)] bg-transparent outline-none tracking-tight"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-[13px] text-[var(--ink-4)] font-[500] self-center">Popüler:</span>
                {['iPhone 15 Pro', 'Samsung S24', 'Xiaomi 14', 'iPad Air'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => { setSearchValue(term); setSearchQuery(term); setShowSearch(false); }}
                    className="px-4 py-1.5 bg-white border border-[var(--ink-6)] rounded-full text-[13px] font-[500] text-[var(--ink-2)] hover:border-[var(--brand)] hover:text-[var(--brand-deep)] hover:bg-[var(--brand-light)] transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mobil Yan Menü ──────────────────────────────────────────────── */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-150">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
          <div className="relative w-[280px] bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            {/* Menü başlığı */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ink-7)]">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center">
                <img src="/logo.png" alt="Mytt" className="h-12 w-auto object-contain scale-125 origin-left" />
              </Link>
              <button onClick={() => setShowMobileMenu(false)} className="text-[var(--ink-4)] hover:text-[var(--ink)] p-1">
                <X size={20} />
              </button>
            </div>

            {/* Kategoriler */}
            <div className="px-3 py-2 border-b border-[var(--ink-7)] flex-1 overflow-y-auto">
              <p className="text-[10px] font-[700] text-[var(--ink-5)] uppercase tracking-widest px-2 py-1.5">Kategoriler</p>
              {MENU_ITEMS.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.label} className="mb-2">
                    <Link
                      href={cat.href}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[15px] font-[600] text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Icon size={16} className="text-slate-500" />
                      {cat.label}
                    </Link>
                    {/* Mobile alt kategoriler */}
                    {cat.megaMenu && (
                      <div className="pl-9 pr-2 py-1 space-y-1">
                        {cat.megaMenu.flatMap(g => g.items).slice(0, 5).map((sub, i) => (
                          <Link
                            key={i}
                            href={sub.href}
                            onClick={() => setShowMobileMenu(false)}
                            className="block py-1.5 text-[13px] text-slate-500 hover:text-slate-900"
                          >
                            {sub.name}
                          </Link>
                        ))}
                        <Link href={cat.href} onClick={() => setShowMobileMenu(false)} className="block py-1.5 text-[12px] font-bold text-slate-900 mt-1">
                          Tümünü Gör &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Auth */}
            <div className="p-4 mt-auto border-t border-[var(--ink-7)]">
              {!user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="w-full py-3 rounded-xl bg-[var(--brand)] text-white font-[600] text-[14px] active:scale-95 transition-transform"
                  >
                    Giriş Yap
                  </button>
                  <Link
                    href="/register"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center w-full py-3 rounded-xl border border-[var(--ink-6)] text-[var(--ink-2)] font-[600] text-[14px] hover:bg-[var(--ink-8)] transition-colors"
                  >
                    Hesap Oluştur
                  </Link>
                  <Link
                    href="/register-dealer"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2 text-[13px] text-[var(--brand-deep)] font-[600] hover:underline"
                  >
                    <Store size={13} /> Bayi Başvurusu
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-deep)] flex items-center justify-center shadow-sm">
                      <span className="text-[13px] font-[800] text-white uppercase">
                        {(user.name || user.email).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[13px] font-[600] text-[var(--ink)]">{user.name}</p>
                      <p className="text-[11px] text-[var(--ink-4)]">{user.email}</p>
                    </div>
                  </div>
                  {(user.role === 'admin' || user.role === 'dealer') && (
                    <Link
                      href={user.role === 'admin' ? '/admin/dashboard' : '/dealer/dashboard'}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-[500] text-[var(--ink-2)] hover:bg-[var(--ink-8)] transition-colors"
                    >
                      <LayoutGrid size={14} className="text-[var(--brand)]" /> Yönetim Paneli
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-[13px] font-[500] text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} /> Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
