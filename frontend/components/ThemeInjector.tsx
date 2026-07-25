'use client';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { useEffect, useReducer } from 'react';
import { setBuilderPreview, subscribeBuilderPreview, getBuilderPreview } from '@/lib/builder-preview';
import { resolveUploadUrl } from '@/lib/resolveUrl';

// ─── 20 Google Font Definitions ───────────────────────────────────────────────
export const FONT_CATALOG: Record<string, { stack: string; gFont: string; desc: string }> = {
  'Outfit':            { stack: '"Outfit", sans-serif',            gFont: 'Outfit:wght@400;500;600;700;800',                                             desc: 'Modern & Yuvarlak' },
  'Inter':             { stack: '"Inter", sans-serif',             gFont: 'Inter:wght@400;500;600;700;800',                                              desc: 'Klasik & Okunaklı' },
  'Roboto':            { stack: '"Roboto", sans-serif',            gFont: 'Roboto:wght@400;500;600;700',                                                 desc: 'Android Stili' },
  'Plus Jakarta Sans': { stack: '"Plus Jakarta Sans", sans-serif', gFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800',                                  desc: 'Premium & Dengeli' },
  'Space Grotesk':     { stack: '"Space Grotesk", sans-serif',     gFont: 'Space+Grotesk:wght@400;500;600;700',                                          desc: 'Avangart & Geometrik' },
  'Poppins':           { stack: '"Poppins", sans-serif',           gFont: 'Poppins:wght@400;500;600;700;800',                                            desc: 'Güncel & Zarif' },
  'Montserrat':        { stack: '"Montserrat", sans-serif',        gFont: 'Montserrat:wght@400;500;600;700;800',                                         desc: 'Güçlü & Modern' },
  'Nunito':            { stack: '"Nunito", sans-serif',            gFont: 'Nunito:wght@400;500;600;700;800',                                             desc: 'Eğlenceli & Yuvarlak' },
  'DM Sans':           { stack: '"DM Sans", sans-serif',           gFont: 'DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700',    desc: 'Minimal & Temiz' },
  'Lato':              { stack: '"Lato", sans-serif',              gFont: 'Lato:wght@400;700',                                                          desc: 'Profesyonel & Güvenilir' },
  'Source Sans 3':     { stack: '"Source Sans 3", sans-serif',     gFont: 'Source+Sans+3:wght@400;500;600;700',                                          desc: 'Kurumsal & Nötr' },
  'Raleway':           { stack: '"Raleway", sans-serif',           gFont: 'Raleway:wght@400;500;600;700;800',                                            desc: 'Şık & İnce' },
  'Josefin Sans':      { stack: '"Josefin Sans", sans-serif',      gFont: 'Josefin+Sans:wght@400;600;700',                                              desc: 'Geometrik & Net' },
  'Quicksand':         { stack: '"Quicksand", sans-serif',         gFont: 'Quicksand:wght@400;500;600;700',                                              desc: 'Yumuşak & Dost' },
  'Barlow':            { stack: '"Barlow", sans-serif',            gFont: 'Barlow:wght@400;500;600;700;800',                                             desc: 'Sporif & Kompakt' },
  'Mulish':            { stack: '"Mulish", sans-serif',            gFont: 'Mulish:wght@400;500;600;700;800',                                             desc: 'Sade & Zarif' },
  'Work Sans':         { stack: '"Work Sans", sans-serif',         gFont: 'Work+Sans:wght@400;500;600;700;800',                                          desc: 'İş Hayatı & Verimli' },
  'Urbanist':          { stack: '"Urbanist", sans-serif',          gFont: 'Urbanist:wght@400;500;600;700;800',                                           desc: 'Şehirli & Modern' },
  'Manrope':           { stack: '"Manrope", sans-serif',           gFont: 'Manrope:wght@400;500;600;700;800',                                            desc: 'Teknik & Dengeli' },
  'Lexend':            { stack: '"Lexend", sans-serif',            gFont: 'Lexend:wght@400;500;600;700;800',                                             desc: 'Okunabilirlik Odaklı' },
};

export default function ThemeInjector() {
  const { data } = useSiteConfig();
  const [, forceRender] = useReducer((n) => n + 1, 0);

  // Listen for postMessage from admin builder iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'BUILDER_PREVIEW' && e.data.settings) {
        setBuilderPreview(e.data.settings, e.data.heroSlides);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Subscribe to preview updates to re-render this component
  useEffect(() => {
    return subscribeBuilderPreview(forceRender);
  }, []);

  // Merge: preview overrides DB settings
  const preview = getBuilderPreview();
  const settings = preview ?? data?.settings;

  // Side effects: title + favicon
  useEffect(() => {
    if (!settings) return;
    if (settings.siteTitle) document.title = settings.siteTitle;
    if (settings.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = resolveUploadUrl(settings.faviconUrl);
    }
  }, [settings]);

  if (!settings) return null;

  const primaryColor  = settings.primaryColor || '#FF6A1A';
  const primaryHover  = settings.primaryColorHover || '#FF8A47';

  // Font: SADECE admin panelden bilinçli olarak seçilmişse devreye girer.
  // Aksi halde layout.tsx'teki KARBON fontları (Space Grotesk / Inter Tight /
  // JetBrains Mono) geçerli kalır. Önceden burada 'Outfit' varsayılanı vardı ve
  // !important ile her şeyi eziyordu — yani layout'taki font seçimi hiç
  // uygulanmıyordu. Artık seçim yoksa hiç müdahale etmiyoruz.
  const fontKey       = settings.fontFamily;
  const fontDef       = fontKey ? FONT_CATALOG[fontKey] : undefined;
  const fontStack     = fontDef?.stack;

  // Text scale: 0.8 – 1.3, default 1.0
  const textScale = Number(settings.textScale ?? 1.0).toFixed(2);

  let buttonRadius = '9999px';
  if (settings.buttonRadius === 'sharp')   buttonRadius = '0px';
  if (settings.buttonRadius === 'rounded') buttonRadius = '8px';

  // Animation Speed
  const animDur  = settings.animationSpeed === 'instant' ? '0s' : settings.animationSpeed === 'cinematic' ? '0.8s' : '0.3s';
  const animEase = settings.animationSpeed === 'cinematic' ? 'cubic-bezier(0.65, 0, 0.35, 1)' : 'cubic-bezier(0.4, 0, 0.2, 1)';

  // Glassmorphism
  const blurLevel = settings.glassmorphismLevel ?? 20;

  // Layout Density
  const densityMult = settings.layoutDensity === 'compact' ? '0.75' : settings.layoutDensity === 'loose' ? '1.25' : '1';

  // Button Styles
  let btnStyles = '';
  if (settings.buttonStyle === 'rounded')      btnStyles = 'border-radius: 8px !important;';
  if (settings.buttonStyle === 'sharp')        btnStyles = 'border-radius: 0px !important;';
  if (settings.buttonStyle === 'soft-shadow')  btnStyles = 'border-radius: 12px !important; box-shadow: 0 10px 25px -5px var(--brand-glow) !important; border: 1px solid rgba(255,255,255,0.2) !important;';
  if (settings.buttonStyle === 'neo-brutalism') btnStyles = 'border-radius: 0px !important; box-shadow: 4px 4px 0px #000 !important; border: 2px solid #000 !important;';
  if (settings.buttonStyle === 'flat')         btnStyles = 'border-radius: 4px !important; box-shadow: none !important;';

  // Google Fonts @import — sadece admin panelden bir font seçildiyse
  const fontCss = fontDef && fontStack
    ? `
        @import url('https://fonts.googleapis.com/css2?family=${fontDef.gFont}&display=swap');

        :root {
          --font-display: ${fontStack};
          --font-sans:    ${fontStack};
        }
        body, button, input, select, textarea,
        h1, h2, h3, h4, h5, h6 {
          font-family: ${fontStack} !important;
        }`
    : '';

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        ${fontCss}

        /* ── Text Scale ─────────────────────────────────────────── */
        html {
          font-size: calc(16px * ${textScale}) !important;
        }

        :root {
          --brand:              ${primaryColor};
          --brand-hover:        ${primaryHover};
          --k-hot:              ${primaryColor};
          --k-hot-2:            ${primaryHover};
          --r-pill:             ${buttonRadius};
          --font-scale:         ${textScale};
          --density-multiplier: ${densityMult};
        }

        /* ── Transitions ────────────────────────────────────────── */
        a, button, input, select, textarea, .glass-card, .btn-brand, .btn-apple, .btn-outline, .transition-all {
          transition: background-color ${animDur} ${animEase},
                      border-color     ${animDur} ${animEase},
                      box-shadow       ${animDur} ${animEase},
                      opacity          ${animDur} ${animEase};
        }

        /* ── Yüzeyler ───────────────────────────────────────────────
           Not: Burada eskiden "background: rgba(255,255,255,0.98) !important"
           vardı — KARBON koyu temasında navbar'ı zorla BEYAZ yapıyordu.
           Artık yüzey rengi tek kaynaktan, karbon tokenlarından geliyor. */
        .glass-card, .glass-nav, .navbar-main {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          background: var(--k-surface) !important;
        }

        /* ── Buttons ────────────────────────────────────────────── */
        .btn-brand, .btn-apple, .btn-outline {
          ${btnStyles || `border-radius: ${buttonRadius} !important;`}
        }

        ${settings.customCss || ''}

        ${settings.enableDarkMode ? `
          body {
            background: #0d1117 !important;
            color: #f3f4f6 !important;
          }
          .glass-card, .bg-[var(--k-surface)], .product-card, .navbar-main {
            background-color: #161b22 !important;
            border-color: #374151 !important;
          }
          .text-\\[var\\(--ink\\)\\], .text-\\[var\\(--ink-2\\)\\], .text-\\[var\\(--ink-3\\)\\] {
            color: #f3f4f6 !important;
          }
          .text-\\[var\\(--ink-4\\)\\], .text-\\[var\\(--ink-5\\)\\] {
            color: #9ca3af !important;
          }
          .bg-\\[var\\(--bg\\)\\] {
            background-color: #0d1117 !important;
          }
        ` : ''}
      `
    }} />
  );
}
