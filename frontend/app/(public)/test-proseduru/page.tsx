import Link from 'next/link';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function TestProseduruPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-[var(--k-surface)] p-8 md:p-12 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--k-line)] pb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[var(--k-ink)]">32-Nokta TSE Ekspertiz Test Prosedürü</h1>
            <p className="text-sm text-[var(--k-ink-3)] font-medium">Sertifikalı Laboratuvar Şartlarında Donanım Testi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-[var(--k-ink)]">
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Ekran & Dokunmatik Hassasiyeti Testi</span>
          </div>
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Batarya Sağlığı & Şarj Döngüsü Analizi</span>
          </div>
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Ön & Arka Kamera Lens / Odak Testi</span>
          </div>
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>FaceID / TouchID Biyometrik Güvenlik</span>
          </div>
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Wi-Fi, Bluetooth & GPS Modül Testi</span>
          </div>
          <div className="p-4 bg-[var(--k-canvas-2)] rounded-2xl border border-[var(--k-line)] flex items-center gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Mikrofon, Hoparlör & Ses Çıkış Testi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
