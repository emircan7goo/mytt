import Link from 'next/link';
import { ShieldCheck, Lock, Award, CheckCircle2, ArrowRight } from 'lucide-react';

export default function GarantiPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[var(--k-hot-wash)] text-[var(--k-hot)] font-extrabold text-xs tracking-wider uppercase border border-[var(--k-line-hot)]">
            %100 ALICI VE SATICI KORUMASI
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--k-ink)] leading-tight">
            TSE 12 Ay Garanti & <span className="text-[var(--k-hot)]">Escrow Güvence Sistemi</span>
          </h1>
          <p className="text-[var(--k-ink-2)] text-base font-medium leading-relaxed">
            Mytt'de satılan ve alınan tüm yenilenmiş cihazlar TSE belgeli merkezimiz tarafından 32-nokta detaylı ekspertiz kontrolünden geçer ve 12 ay boyunca birebir teknik garanti altına alınır.
          </p>
        </div>

        {/* 3 Ana Güven Sütunu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--k-hot)] text-[var(--k-hot-ink)] flex items-center justify-center shadow-lg">
              <Award size={28} />
            </div>
            <h3 className="text-xl font-black text-[var(--k-ink)]">TSE Sertifikalı Ekspertiz</h3>
            <p className="text-[var(--k-ink-2)] text-xs font-medium leading-relaxed">
              Her cihaz; ekran, batarya, kamera, mikrofon, FaceID ve ana kart dâhil olmak üzere 32 teknik noktadan test edilir.
            </p>
          </div>

          <div className="bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
              <Lock size={28} />
            </div>
            <h3 className="text-xl font-black text-[var(--k-ink)]">Escrow Havuz Hesabı</h3>
            <p className="text-[var(--k-ink-2)] text-xs font-medium leading-relaxed">
              Ödemeniz güvenli havuz hesabında bloke edilir. Cihazınızı teslim alıp onaylayana kadar paranız %100 güvendedir.
            </p>
          </div>

          <div className="bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-md space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-black text-[var(--k-ink)]">12 Ay Birebir Garanti</h3>
            <p className="text-[var(--k-ink-2)] text-xs font-medium leading-relaxed">
              Kullanım süresince oluşabilecek tüm donanımsal arızalarda ücretsiz yetkili teknik servis desteği sunuyoruz.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-[var(--k-hot)] to-[var(--k-hot-deep)] rounded-3xl p-8 text-[var(--k-hot-ink)] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-black">Cihazınızı Güvenle Satışa Çıkarın!</h2>
            <p className="text-[rgba(26,13,2,0.72)] text-sm font-medium">150+ Onaylı yetkili bayi cihazınız için teklif yarıştırsın.</p>
          </div>
          <Link
            href="/sell"
            className="px-8 py-4 rounded-full bg-[var(--k-surface)] text-[var(--k-hot)] font-black text-sm hover:bg-[var(--k-hot-wash)] transition-all shadow-lg flex items-center gap-2 shrink-0"
          >
            <span>Hemen Satış Başlat</span>
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </div>
  );
}
