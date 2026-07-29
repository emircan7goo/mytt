'use client';
import { useState, useEffect } from 'react';
import { ShieldCheck, Zap, CheckCircle2, X } from 'lucide-react';

const PROOFS = [
  { name: 'Ahmet K.', city: 'İstanbul', action: 'iPhone 14 Pro (128GB)', price: '34.500 ₺', time: '2 dakika önce', type: 'SATTI' },
  { name: 'Mehmet S.', city: 'Ankara', action: 'Galaxy S24 Ultra', price: '48.200 ₺', time: '5 dakika önce', type: 'TEKLİF KABUL' },
  { name: 'Zeynep B.', city: 'İzmir', action: 'iPhone 13 Pro Max', price: '38.900 ₺', time: '8 dakika önce', type: 'SATTI' },
  { name: 'Caner T.', city: 'Bursa', action: 'iPhone 15 Pro', price: '46.000 ₺', time: '12 dakika önce', type: 'TAKAS YAPTI' },
  { name: 'Elif M.', city: 'Antalya', action: 'Galaxy S23+', price: '26.400 ₺', time: '15 dakika önce', type: 'SATTI' },
];

export default function LiveSocialProof() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // İlk gösterim 4sn sonra
    const initialTimer = setTimeout(() => {
      setVisible(true);
    }, 4000);

    // Her 12sn'de bir değiştir
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PROOFS.length);
        setVisible(true);
      }, 600);
    }, 11000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (dismissed || !visible) return null;

  const current = PROOFS[index];

  return (
    <div className="fixed bottom-5 left-5 z-50 animate-bounce-subtle transition-all duration-500">
      <div className="relative flex items-center gap-3.5 p-3.5 pr-9 bg-[var(--k-surface)]/95 backdrop-blur-md border border-[var(--k-line)] rounded-2xl shadow-2xl shadow-indigo-900/15 max-w-[340px]">
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2.5 top-2.5 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors p-1"
          aria-label="Kapat"
        >
          <X size={14} />
        </button>

        <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
          <Zap size={20} className="fill-emerald-500 text-emerald-600" />
        </div>

        <div className="text-left leading-tight">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--k-ink-3)]">
            <span className="font-bold text-[var(--k-ink)]">{current.name}</span>
            <span>({current.city})</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-extrabold ml-auto">
              {current.type}
            </span>
          </div>
          <div className="text-xs font-black text-[var(--k-ink)] mt-1">
            {current.action} → <span className="text-indigo-600">{current.price}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[var(--k-ink-4)] font-medium mt-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span>Doğrulanmış İşlem · {current.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
