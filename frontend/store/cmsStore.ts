import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────────────────
// The 'Wix-Killer' CMS SiteConfig Schema
// ─────────────────────────────────────────────────────────────────────────────

export interface TypographySettings {
  title: string;
  subtitle: string;
  titleSizeDesktop: number; // Responsive Typography
  titleSizeMobile: number;
  fontWeight: string;
  letterSpacing: number; // Tracking
}

export interface BoxDesignSettings {
  bgGradientFrom: string;
  bgGradientTo: string;
  gradientDirection: string; // e.g. 'to-br', 'to-tr'
  backdropBlur: number; // Glassmorphism intensity
  borderColor: string;
  borderOpacity: number;
  padding: number; // Spacing
  margin: number;
  invertColors: boolean; // Dark/Light invert override
}

export interface ImageSettings {
  src: string;
  scale: number; // Zoom
  posX: number; // Absolute X
  posY: number; // Absolute Y
  objectFit: 'cover' | 'contain' | 'fill';
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'luminosity'; // Advanced Blend Mode
}

export interface HoverState {
  enabled: boolean;
  scaleFactor: number;
  shadowIntensity: number; // Hover State Studio
  bgColorSwap?: string;
}

export interface ShadowSettings {
  active: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

export interface BadgeSettings {
  active: boolean;
  text: string;
  colorBg: string;
  colorText: string;
  xPercent: number; // Free-Float Engine
  yPercent: number;
}

export interface AnimationSettings {
  entranceVariant: 'fade' | 'slide-up' | 'zoom-in' | 'spring' | 'none';
  delay: number;
  duration: number;
}

export interface CtaSettings {
  text: string;
  bgColor: string;
  textColor: string;
  href: string;
  isMagnetic: boolean; // Awwwards Magnetic Button
}

export interface BentoBlock {
  id: string;
  type: 'hero-main' | 'hero-side' | 'hero-bottom';
  visibility: {
    desktop: boolean;
    mobile: boolean;
  };
  typography: TypographySettings;
  design: BoxDesignSettings;
  image: ImageSettings;
  hover: HoverState;
  shadow: ShadowSettings;
  badge: BadgeSettings;
  animation: AnimationSettings;
  cta: CtaSettings;
  customCSS: string; // Advanced Code Injection
}

export interface SiteConfig {
  blocks: BentoBlock[];
}

// ── Default State (Emerald Supernova Edition) ──────────────────────────
export const DEFAULT_SITE_CONFIG: SiteConfig = {
  blocks: [
    {
      id: 'hero-emerald-main',
      type: 'hero-main',
      visibility: { desktop: true, mobile: true },
      typography: {
        title: 'Kusursuzluğu Yeniden Keşfet.',
        subtitle: 'Sıfır hata, maksimum ferahlık. Yepyeni bir lüks deneyim.',
        titleSizeDesktop: 84, // Larger but lighter
        titleSizeMobile: 42,
        fontWeight: '300', // Featherweight font
        letterSpacing: -2.5, // Tighter tracking for elegance
      },
      design: {
        bgGradientFrom: '#064e3b', // emerald-950
        bgGradientTo: '#0f172a',   // slate-900
        gradientDirection: 'to-br',
        backdropBlur: 24,
        borderColor: '#10b981',    // emerald-500
        borderOpacity: 30,
        padding: 50,
        margin: 0,
        invertColors: false,
      },
      image: {
        src: 'https://pngimg.com/uploads/iphone_14/iphone_14_PNG17.png', // Premium HQ iPhone render
        scale: 1.0,
        posX: 50,
        posY: 50,
        objectFit: 'contain',
        blendMode: 'normal',
      },
      hover: {
        enabled: true,
        scaleFactor: 1.03,
        shadowIntensity: 40,
      },
      shadow: {
        active: true,
        x: 0,
        y: 30,
        blur: 60,
        spread: -15,
        color: '#000000',
        opacity: 40,
      },
      badge: {
        active: true,
        text: 'PREMIUM COLLECTION',
        colorBg: '#fbbf24', // Amber/Gold
        colorText: '#064e3b',
        xPercent: 8,
        yPercent: 8,
      },
      animation: {
        entranceVariant: 'spring',
        delay: 0,
        duration: 1.2,
      },
      cta: {
        text: 'Koleksiyonu Keşfet',
        bgColor: '#10b981',
        textColor: '#ffffff',
        href: '/koleksiyon',
        isMagnetic: true,
      },
      customCSS: 'text-shadow: 0 10px 30px rgba(0,0,0,0.3);',
    },
    {
      id: 'hero-side-airpods',
      type: 'hero-side',
      visibility: { desktop: true, mobile: true },
      typography: {
        title: 'Sınırlı Özel Seri',
        subtitle: 'AirPods Pro 2. Nesil',
        titleSizeDesktop: 24,
        titleSizeMobile: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
      },
      design: {
        bgGradientFrom: '#065f46', // green-800
        bgGradientTo: '#064e3b',   // emerald-950
        gradientDirection: 'to-b',
        backdropBlur: 10,
        borderColor: '#ffffff',
        borderOpacity: 10,
        padding: 30,
        margin: 0,
        invertColors: false,
      },
      image: {
        src: 'https://images.samsung.com/is/image/samsung/p6pim/tr/2401/gallery/tr-galaxy-s24-s928-sm-s928bztqtur-539572455?$650_519_PNG$', // HQ S24 Ultra
        scale: 0.9,
        posX: 50,
        posY: 50,
        objectFit: 'contain',
        blendMode: 'normal',
      },
      hover: { enabled: true, scaleFactor: 1.05, shadowIntensity: 30 },
      shadow: { active: true, x:0, y:15, blur:30, spread:-5, color:'#000000', opacity:25 },
      badge: { active: false, text: '', colorBg: '', colorText: '', xPercent: 0, yPercent: 0 },
      animation: { entranceVariant: 'fade', delay: 0.3, duration: 0.8 },
      cta: { text: 'İncele', bgColor: '#ffffff', textColor: '#064e3b', href: '#', isMagnetic: false },
      customCSS: '',
    },
    {
      id: 'hero-side-s24',
      type: 'hero-side',
      visibility: { desktop: true, mobile: true },
      typography: {
        title: 'Titanium Zarafeti',
        subtitle: 'Galaxy S24 Ultra',
        titleSizeDesktop: 24,
        titleSizeMobile: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
      },
      design: {
        bgGradientFrom: '#1e293b', // slate-800
        bgGradientTo: '#0f172a',   // slate-900
        gradientDirection: 'to-b',
        backdropBlur: 10,
        borderColor: '#ffffff',
        borderOpacity: 10,
        padding: 30,
        margin: 0,
        invertColors: false,
      },
      image: {
        src: 'https://pngimg.com/uploads/macbook/macbook_PNG8.png', // Ultra HQ Apple Laptop
        scale: 0.95,
        posX: 50,
        posY: 50,
        objectFit: 'contain',
        blendMode: 'normal',
      },
      hover: { enabled: true, scaleFactor: 1.05, shadowIntensity: 30 },
      shadow: { active: true, x:0, y:15, blur:30, spread:-5, color:'#000000', opacity:25 },
      badge: { active: false, text: '', colorBg: '', colorText: '', xPercent: 0, yPercent: 0 },
      animation: { entranceVariant: 'fade', delay: 0.5, duration: 0.8 },
      cta: { text: 'İncele', bgColor: '#ffffff', textColor: '#0f172a', href: '#', isMagnetic: false },
      customCSS: '',
    }
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// CMS Store with Time-Travel (Undo/Redo)
// ─────────────────────────────────────────────────────────────────────────────

interface CMSState {
  config: SiteConfig;
  past: SiteConfig[];
  future: SiteConfig[];
  draftSavedAt: number | null;

  // Actions
  updateConfig: (newConfig: SiteConfig) => void;
  updateBlock: (blockId: string, updates: Partial<BentoBlock>) => void;
  
  // Time Travel
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // File IO
  pingAutoSave: () => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_SITE_CONFIG,
      past: [],
      future: [],
      draftSavedAt: null,

      updateConfig: (newConfig) =>
        set((state) => ({
          past: [...state.past, state.config], // Push current to past
          config: newConfig,
          future: [], // Clear future on new action
        })),

      updateBlock: (blockId, updates) =>
        set((state) => {
          const newBlocks = state.config.blocks.map((b) =>
            b.id === blockId ? { ...b, ...updates } : b
          );
          const newConfig = { ...state.config, blocks: newBlocks };
          return {
            past: [...state.past, state.config],
            config: newConfig,
            future: [],
            draftSavedAt: Date.now(),
          };
        }),

      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state;
          const previous = state.past[state.past.length - 1];
          const newPast = state.past.slice(0, state.past.length - 1);
          return {
            past: newPast,
            config: previous,
            future: [state.config, ...state.future],
          };
        }),

      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state;
          const next = state.future[0];
          const newFuture = state.future.slice(1);
          return {
            past: [...state.past, state.config],
            config: next,
            future: newFuture,
          };
        }),

      get canUndo() {
        return get().past.length > 0;
      },
      get canRedo() {
        return get().future.length > 0;
      },

      pingAutoSave: () => set({ draftSavedAt: Date.now() }),
    }),
    {
      name: 'mytt-cms-draft',
      // Only persist the config, not the entire history which could bloat storage
      partialize: (state) => ({ config: state.config, draftSavedAt: state.draftSavedAt }),
      version: 6,
      migrate: (persistedState: any, version: number) => {
        if (version !== 6) {
           return { config: DEFAULT_SITE_CONFIG, draftSavedAt: null };
        }
        return persistedState;
      }
    }
  )
);

// ─── Cross-Tab Synchronization ───────────────────────────────────────────────
// When the store changes via persistence in another tab, Zustand doesn't naturally hydrate.
// This small event listener catches localStorage changes and forces the store to update.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'mytt-cms-draft' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        if (parsed?.state?.config) {
          useCMSStore.setState({ config: parsed.state.config, draftSavedAt: parsed.state.draftSavedAt });
        }
      } catch {
        // Silently fail on invalid JSON
      }
    }
  });
}
