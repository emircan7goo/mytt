'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useState, useEffect } from 'react';
import { getBuilderPreview, subscribeBuilderPreview } from '@/lib/builder-preview';

interface ServiceBubble {
  id: number;
  title1: string;
  title2: string;
  iconUrl: string;
  link: string;
  bg: string;
  iconSize?: 'small' | 'medium' | 'large' | 'full';
}

// ─── Varsayılan servis listesi (CMS yok ise gösterilir) ───────────────────────
const DEFAULT_SERVICES = [
  { id: 1, title1: 'Vade Farksız',   title2: '9 Taksit!',   image: '/icons/icon_taksit.png',    link: '/?promo=taksit'    },
  { id: 2, title1: 'İndirimli Paket',title2: 'Ürünler!',    image: '/icons/icon_indirim.png',   link: '/?promo=paket'     },
  { id: 3, title1: 'Sıfır',          title2: 'Telefonlar',  image: '/icons/icon_sifir.png',     link: '/?cat=Sıfır'       },
  { id: 4, title1: 'Kaçmaz',         title2: 'Fiyatlar!',   image: '/icons/icon_fiyat.svg',     link: '/?promo=kampanya'  },
  { id: 5, title1: 'Akıllı',         title2: 'Eşleştirme',  image: '/icons/icon_eslestirme.svg',link: '/secim-asistani'   },
  { id: 6, title1: 'Mytt',           title2: 'Güvencesi',   image: '/icons/icon_guvence.svg',   link: '/garanti'          },
  { id: 7, title1: 'Mağazadan',      title2: 'Teslim Al',   image: '/icons/icon_magaza.svg',    link: '/magazalar'        },
  { id: 8, title1: 'Sıkça Sorulan',  title2: 'Sorular',     image: '/icons/icon_sss.svg',       link: '/yardim'           },
] as const;


// ─── CMS bubble bg → gradient eşlemesi ───────────────────────────────────────
const BG_GRADIENTS: Record<string, { gradient: string }> = {
  indigo:  { gradient: 'from-orange-100 to-orange-50'  },
  rose:    { gradient: 'from-rose-100 to-pink-50'      },
  emerald: { gradient: 'from-orange-100 to-orange-50'   },
  amber:   { gradient: 'from-amber-100 to-yellow-50'   },
  sky:     { gradient: 'from-sky-100 to-blue-50'       },
  violet:  { gradient: 'from-orange-100 to-orange-50'  },
  fuchsia: { gradient: 'from-fuchsia-100 to-pink-50'   },
  teal:    { gradient: 'from-orange-100 to-orange-50'   },
  orange:  { gradient: 'from-orange-100 to-amber-50'   },
  green:   { gradient: 'from-green-100 to-orange-50'  },
};

// CMS index → local SVG icon fallback
const CMS_ICON_FALLBACKS = [
  '/icons/icon_taksit.svg',
  '/icons/icon_indirim.svg',
  '/icons/icon_sifir.svg',
  '/icons/icon_fiyat.svg',
  '/icons/icon_eslestirme.svg',
  '/icons/icon_guvence.svg',
  '/icons/icon_magaza.svg',
  '/icons/icon_sss.svg',
];

const FALLBACK_GRADIENTS = [
  'from-orange-100 to-orange-50',
  'from-orange-100 to-amber-50',
  'from-orange-100 to-orange-50',
  'from-sky-100 to-blue-50',
  'from-yellow-100 to-amber-50',
  'from-orange-100 to-green-50',
  'from-rose-100 to-pink-50',
  'from-slate-100 to-gray-50',
];

// ─── Balon boyut sistemi ────────────────────────────────────────────────
const BUBBLE_SIZES = {
  sm: { box: 80,  radius: '20px', textSm: '11px', textLg: '12px', maxW: '88px',  gap: 'gap-2.5' },
  md: { box: 96,  radius: '24px', textSm: '11px', textLg: '13px', maxW: '100px', gap: 'gap-3'   },
  lg: { box: 112, radius: '28px', textSm: '12px', textLg: '14px', maxW: '116px', gap: 'gap-3.5' },
  xl: { box: 130, radius: '32px', textSm: '13px', textLg: '15px', maxW: '134px', gap: 'gap-4'   },
} as const;

// ─── Default Bubble ────────────────────────────────────────────────
function DefaultBubble({
  svc,
  size,
}: {
  svc: typeof DEFAULT_SERVICES[number];
  size: typeof BUBBLE_SIZES[keyof typeof BUBBLE_SIZES];
}) {
  return (
    <Link href={svc.link} className={`flex flex-col items-center ${size.gap} group flex-shrink-0`}>
      <div
        className="relative flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1.5"
        style={{
          width: size.box,
          height: size.box,
          borderRadius: size.radius,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        <img
          src={svc.image}
          alt={`${svc.title1} ${svc.title2}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <p className="text-center leading-tight" style={{ maxWidth: size.maxW }}>
        <span className="block font-semibold text-[var(--k-ink-3)]" style={{ fontSize: size.textSm }}>{svc.title1}</span>
        <span
          className="block font-black text-slate-900 mt-0.5 group-hover:text-indigo-600 transition-colors"
          style={{ fontSize: size.textLg }}
        >
          {svc.title2}
        </span>
      </p>
    </Link>
  );
}

// ─── CMS Bubble ────────────────────────────────────────────────
function CmsBubble({
  bubble,
  size,
  index,
}: {
  bubble: ServiceBubble;
  size: typeof BUBBLE_SIZES[keyof typeof BUBBLE_SIZES];
  index: number;
}) {
  const colorSet = BG_GRADIENTS[bubble.bg] ?? { gradient: FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length] };
  const imgSrc = bubble.iconUrl
    ? resolveUploadUrl(bubble.iconUrl)
    : CMS_ICON_FALLBACKS[index % CMS_ICON_FALLBACKS.length];

  return (
    <Link href={bubble.link} className={`flex flex-col items-center ${size.gap} group flex-shrink-0`}>
      <div
        className="relative flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1.5"
        style={{
          width: size.box,
          height: size.box,
          borderRadius: size.radius,
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        }}
      >
        <img
          src={imgSrc}
          alt={`${bubble.title1} ${bubble.title2}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
      <p className="text-center leading-tight" style={{ maxWidth: size.maxW }}>
        <span className="block font-semibold text-[var(--k-ink-3)]" style={{ fontSize: size.textSm }}>{bubble.title1}</span>
        <span
          className="block font-black text-slate-900 mt-0.5 group-hover:text-indigo-600 transition-colors"
          style={{ fontSize: size.textLg }}
        >
          {bubble.title2}
        </span>
      </p>
    </Link>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ServiceBubbles() {
  const { data: configData, isLoading } = useSiteConfig();
  const [, forceRender] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    return subscribeBuilderPreview(() => forceRender(n => n + 1));
  }, []);

  const previewSettings = getBuilderPreview();
  const settings = previewSettings ?? configData?.settings;
  const cmsBubbles: ServiceBubble[] | undefined = settings?.serviceBubbles;
  const hasCmsBubbles = mounted && !isLoading && Array.isArray(cmsBubbles) && cmsBubbles.length > 0;

  const sizeKey = (settings?.bubbleSize ?? 'md') as keyof typeof BUBBLE_SIZES;
  const size = BUBBLE_SIZES[sizeKey] ?? BUBBLE_SIZES.md;

  return (
    <section className="w-full bg-[var(--k-surface)] border-b border-[var(--k-line)] py-4">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-8">
        <div
          className="flex items-center justify-between gap-3 overflow-x-auto py-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {hasCmsBubbles
            ? cmsBubbles!.map((b, i) => <CmsBubble key={b.id} bubble={b} size={size} index={i} />)
            : DEFAULT_SERVICES.map(s => <DefaultBubble key={s.id} svc={s} size={size} />)
          }
        </div>
      </div>
    </section>
  );
}
