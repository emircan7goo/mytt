'use client';
import { useState, useEffect } from 'react';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { getBuilderPreview, subscribeBuilderPreview } from '@/lib/builder-preview';

// Varsayılan duyuru metni — admin panelinden değiştirilebilir
const DEFAULT_TICKER =
  '🏆 Türkiye\'nin En Güvenilir Cihaz Pazaryeri' +
  ' | 📦 Vade Farksız 12 Taksit' +
  ' | ✅ 21 Nokta Kalite Kontrol' +
  ' | 🚀 Aynı Gün Kargo' +
  ' | 🔒 TSE Onaylı Kalite Güvencesi' +
  ' | 🛡️ Sıfır ve Hatasız 2. El Garantisi' +
  ' | 🎁 Ücretsiz Kargo 3.000 ₺ Üzeri';

export default function AnnouncementTicker() {
  const { data: configData } = useSiteConfig();
  const [, forceRender] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hydration guard — mount olunca true olur
  useEffect(() => { setMounted(true); }, []);

  // Builder preview live-sync (yalnızca client'ta)
  useEffect(() => {
    return subscribeBuilderPreview(() => forceRender(n => n + 1));
  }, []);

  // SSR placeholder — aynı yükseklik, içerik yok → hydration match
  if (!mounted) {
    return (
      <div
        className="h-[36px]"
        style={{
          background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #1e3a2f 100%)',
        }}
        aria-hidden="true"
      />
    );
  }

  // Aşağısı yalnızca client'ta çalışır (getBuilderPreview localStorage okur)
  const settings  = getBuilderPreview() ?? configData?.settings;
  const rawTicker = (settings as any)?.ticker || DEFAULT_TICKER;

  const items = rawTicker
    .split('|')
    .map((s: string) => s.trim())
    .filter(Boolean) as string[];

  // Kesintisiz döngü için içeriği 4 kez tekrar et
  const repeated = [...items, ...items, ...items, ...items];

  return (
    <div
      className="h-[36px] overflow-hidden flex items-center"
      style={{
        background: 'linear-gradient(135deg, #0B1120 0%, #0F172A 50%, #1e3a2f 100%)',
      }}
      aria-label="Duyuru Bandı"
    >
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        <div
          className="flex items-center whitespace-nowrap"
          style={{ width: 'max-content', animation: 'ticker-scroll 60s linear infinite', willChange: 'transform' }}
        >
          {repeated.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center shrink-0 text-white/85 text-[12px] font-medium tracking-wide select-none"
            >
              <span className="px-6">{item}</span>
              <span
                className="shrink-0 text-[8px] leading-none"
                style={{ color: '#C4B5FD' }}
                aria-hidden
              >
                ◆
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
