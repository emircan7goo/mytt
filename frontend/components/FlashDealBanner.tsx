'use client';
import { useState, useEffect, useCallback } from 'react';
import { X, Zap } from 'lucide-react';
import { useSiteConfig } from '@/lib/hooks/useSiteConfig';
import { getBuilderPreview, subscribeBuilderPreview } from '@/lib/builder-preview';

const SESSION_KEY = 'mytt-flash-banner-dismissed';

interface TimeLeft {
  hours:   number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(targetIso: string): TimeLeft | null {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (diff <= 0) return null;
  const totalSec = Math.floor(diff / 1000);
  return {
    hours:   Math.floor(totalSec / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function FlashDealBanner() {
  const { data: configData } = useSiteConfig();
  const [, forceRender] = useState(0);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) === '1';
  });
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  // Builder preview live-sync
  useEffect(() => {
    return subscribeBuilderPreview(() => forceRender(n => n + 1));
  }, []);

  const settings        = getBuilderPreview() ?? configData?.settings;
  const bannerActive    = settings?.topBannerActive ?? false;
  const bannerText      = settings?.topBannerText ?? '';
  const bannerCountdown = settings?.topBannerCountdown ?? '';

  // Initialise & tick countdown
  useEffect(() => {
    if (!bannerActive || !bannerCountdown) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(calcTimeLeft(bannerCountdown));

    const id = setInterval(() => {
      setTimeLeft(calcTimeLeft(bannerCountdown));
    }, 1000);

    return () => clearInterval(id);
  }, [bannerActive, bannerCountdown]);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  }, []);

  if (!bannerActive || dismissed) return null;

  const showCountdown = bannerCountdown && timeLeft !== null;

  return (
    <div
      role="banner"
      aria-label="Flaş Kampanya Duyurusu"
      className="relative h-9 flex items-center justify-between px-4 z-50 shrink-0"
      style={{
        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
      }}
    >
      {/* Left — icon + message */}
      <div className="flex items-center gap-2 min-w-0">
        <Zap
          size={14}
          className="shrink-0 text-yellow-300 fill-yellow-300"
          aria-hidden
        />
        <span className="text-white text-[12px] font-semibold tracking-wide truncate leading-none select-none">
          {bannerText}
        </span>
      </div>

      {/* Right — countdown + X */}
      <div className="flex items-center gap-3 shrink-0 ml-3">
        {showCountdown && (
          <div
            className="flex items-center gap-1.5 text-white"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest leading-none">
              Kalan
            </span>
            <span className="font-mono text-[13px] font-bold leading-none tabular-nums">
              {pad(timeLeft!.hours)}:{pad(timeLeft!.minutes)}:{pad(timeLeft!.seconds)}
            </span>
          </div>
        )}

        <button
          onClick={handleDismiss}
          aria-label="Duyuruyu kapat"
          className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors shrink-0"
        >
          <X size={11} className="text-white" aria-hidden />
        </button>
      </div>
    </div>
  );
}
