'use client';
/**
 * CookieConsent.tsx
 * KVKK / ePR uyumlu çerez onay banner'ı.
 * Tercih localStorage'da 1 yıl saklanır.
 * Analitik çerezler yalnızca "Tümünü Kabul Et" seçilirse yüklenir.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORAGE_KEY = 'cookie_consent';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

type ConsentState = 'accepted' | 'rejected' | null;

function loadConsent(): ConsentState {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value: ConsentState; expiry: number };
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.value;
  } catch {
    return null;
  }
}

function saveConsent(value: ConsentState) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ value, expiry: Date.now() + ONE_YEAR_MS }),
  );
}

export default function CookieConsent() {
  const [consent, setConsent]   = useState<ConsentState>(null);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(loadConsent());
  }, []);

  const accept = () => {
    saveConsent('accepted');
    setConsent('accepted');
    // GA4 yükle (varsa)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
  };

  const reject = () => {
    saveConsent('rejected');
    setConsent('rejected');
  };

  // SSR'da veya tercih zaten verilmişse gösterme
  if (!mounted || consent !== null) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="cookie-banner"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9999]"
        role="dialog"
        aria-label="Çerez onayı"
        aria-live="polite"
      >
        <div className="bg-[var(--k-surface)] border border-[var(--k-line)] shadow-2xl shadow-zinc-900/10 rounded-2xl p-5 relative">
          {/* Kapat (Reddet) */}
          <button
            onClick={reject}
            aria-label="Kapat"
            className="absolute top-3 right-3 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors"
          >
            <X size={16} />
          </button>

          <p className="text-[var(--k-ink)] text-sm font-semibold mb-1">🍪 Çerez Tercihleri</p>
          <p className="text-[var(--k-ink-3)] text-xs leading-relaxed mb-4">
            Oturum ve güvenlik için zorunlu çerezler kullanıyoruz. İzin verirseniz
            deneyiminizi iyileştirmek için analitik çerezler de kullanırız.{' '}
            <Link
              href="/cerez-politikasi"
              className="text-[var(--k-ink)] underline underline-offset-2 hover:no-underline"
            >
              Detaylar
            </Link>
          </p>

          <div className="flex gap-2">
            <button
              onClick={reject}
              className="flex-1 text-xs font-medium px-4 py-2.5 rounded-xl border border-[var(--k-line)] text-[var(--k-ink-2)] hover:bg-[var(--k-surface-2)] transition-colors"
            >
              Yalnızca Zorunlu
            </button>
            <button
              onClick={accept}
              className="flex-1 text-xs font-bold px-4 py-2.5 rounded-xl bg-[var(--k-canvas)] text-white hover:bg-[var(--k-void)] transition-colors"
            >
              Tümünü Kabul Et
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
