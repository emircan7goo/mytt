import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function KariyerPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-[var(--k-surface)] p-8 md:p-12 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--k-line)] pb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--k-ink)]">Kariyer & Açık Pozisyonlar</h1>
            <p className="text-sm text-[var(--k-ink-3)] font-medium">Geleceğin Teknoloji Ticaretini Birlikte İnşa Edelim</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[var(--k-ink)]">Kıdemli Frontend Geliştirici (React / Next.js)</h3>
              <p className="text-xs text-[var(--k-ink-3)] font-medium">İstanbul (Hibrit) · Tam Zamanlı</p>
            </div>
            <Link href="/iletisim" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors">Başvur</Link>
          </div>

          <div className="p-6 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-[var(--k-ink)]">TSE Sertifikalı Ekspertiz Uzmanı</h3>
              <p className="text-xs text-[var(--k-ink-3)] font-medium">İstanbul Levent Merkez · Tam Zamanlı</p>
            </div>
            <Link href="/iletisim" className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors">Başvur</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
