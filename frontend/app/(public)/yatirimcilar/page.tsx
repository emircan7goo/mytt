import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function YatirimcilarPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-[var(--k-surface)] p-8 md:p-12 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--k-line)] pb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--k-ink)]">Yatırımcı İlişkileri</h1>
            <p className="text-sm text-[var(--k-ink-3)] font-medium">Büyüme Raporları ve Finansal Şeffaflık</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[var(--k-ink-2)] font-medium leading-relaxed">
          <p>
            Mytt Teknoloji A.Ş., döngüsel teknoloji ekonomisinde Türkiye'nin en hızlı büyüyen dijital pazaryeri platformudur.
          </p>

          <div className="p-6 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)]">
            <h4 className="font-black text-[var(--k-ink)] text-sm">Yatırımcı İletişim:</h4>
            <p className="text-xs text-[var(--k-ink-2)] mt-1">ir@mytt.com.tr · Maslak Mah. Büyükdere Cad. No:245, İstanbul</p>
          </div>
        </div>
      </div>
    </div>
  );
}
