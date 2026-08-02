'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Store, Truck, Lock, CheckCircle2, Smartphone, Award, CreditCard, ChevronRight } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    title: '1. Cihazını Ekle',
    badge: '30 SANİYEDE ÜCRETSİZ',
    heading: 'Cihaz Bilgilerini Gir & İhaleyi Başlat',
    description: 'Marka, model ve durum bilgilerini seç. Cihazın anında 150+ yetkili bayinin canlı ihale ekranına düşsün.',
    icon: Smartphone,
    color: 'from-orange-500 to-amber-500',
    statLabel: 'Ortalama İhale Süresi',
    statValue: '1 Saat',
  },
  {
    id: 2,
    title: '2. Bayiler Yarışsın',
    badge: '150+ ONAYLI BAYİ',
    heading: 'Bayiler En Yüksek Fiyat İçin Yarışsın',
    description: 'Kapalı ihalemiz sayesinde yetkili bayiler birbirlerinin teklifini görmeden en yüksek rakamı vermek için rekabet eder.',
    icon: Store,
    color: 'from-amber-500 to-emerald-500',
    statLabel: 'En Yüksek Fiyat Garantisi',
    statValue: '%100 Net',
  },
  {
    id: 3,
    title: '3. Anında Ödeme',
    badge: 'BDDK ESCROW GÜVENCESİ',
    heading: 'Kapıdan Ücretsiz Teslim & 15 Dk Ödeme',
    description: 'En yüksek teklifi onaylayın, VIP kuryemiz kapınızdan teslim alsın. Ekspertiz onayından 15 dk sonra paranız bankanızda!',
    icon: CreditCard,
    color: 'from-emerald-500 to-teal-500',
    statLabel: 'Banka Transfer Süresi',
    statValue: '15 Dakika',
  },
];

export default function QuickValuationWidget() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Otomatik geçiş efekti (her 3.5 saniyede bir sonraki adıma pürüzsüz geçiş)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const activeStep = STEPS[activeStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <div className="w-full max-w-full rounded-2xl sm:rounded-3xl bg-[var(--k-surface)] border border-[var(--k-line-2)] p-4 sm:p-10 shadow-2xl relative overflow-hidden my-4 sm:my-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Değer Önerisi & Özellikler */}
        <div className="lg:col-span-6 text-left space-y-3 sm:space-y-5 min-w-0">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)] text-[var(--k-hot)] text-xs font-black">
            <Zap size={14} className="fill-[var(--k-hot)]" />
            <span>%100 REKABETÇİ İHALE SİSTEMİ</span>
          </div>

          <h3 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            Cihazını İhaleye Çıkar, <span className="text-[var(--k-hot)]">150+ Onaylı Bayi Sizin İçin Yarışsın!</span>
          </h3>

          <p className="text-xs sm:text-base text-[var(--k-ink-3)] font-medium leading-relaxed max-w-xl">
            Cihaz bilgilerinizi girin, 1 saatlik kapalı canlı ihalede tüm yetkili bayiler birbirleriyle yarışarak en yüksek fiyat teklifini versin. Teklifinizi onaylayın, paranız anında yatsın.
          </p>

          {/* 3 Özellik Rozeti */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--k-void)] border border-[var(--k-line-2)]">
              <Store size={18} className="text-[var(--k-hot)] shrink-0" />
              <div className="text-[11px] font-bold text-[var(--k-ink-2)] leading-tight">
                150+ Onaylı Bayi Yarışır
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--k-void)] border border-[var(--k-line-2)]">
              <Truck size={18} className="text-[var(--k-hot)] shrink-0" />
              <div className="text-[11px] font-bold text-[var(--k-ink-2)] leading-tight">
                Ücretsiz Kapıdan Kurye
              </div>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--k-void)] border border-[var(--k-line-2)]">
              <Lock size={18} className="text-[var(--k-hot)] shrink-0" />
              <div className="text-[11px] font-bold text-[var(--k-ink-2)] leading-tight">
                BDDK Escrow Güvencesi
              </div>
            </div>
          </div>

          {/* Sol Aksiyon Butonu */}
          <div className="pt-2">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-xs sm:text-base transition-all shadow-xl shadow-[var(--k-hot-glow)] hover:scale-[1.02] active:scale-98"
            >
              <span>Cihazını Ücretsiz İhaleye Başlat</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

        {/* Sağ Taraf: İNTERAKTİF DİNAMİK İHALE SÜRECİ ŞOV KARTI (DİNAMİK GEÇİŞ EFEKTLİ) */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-[var(--k-void)] p-5 sm:p-7 text-white text-left space-y-4 shadow-2xl relative overflow-hidden border border-[var(--k-hot-deep)]/50 group">
            
            {/* Arka Plan Neonsal Parlama */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-[var(--k-hot)]/20 to-amber-500/10 blur-3xl pointer-events-none" />

            {/* İnteraktif Adım Sekmeleri (Tab Switcher) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[var(--k-surface)] rounded-xl border border-[var(--k-line-2)]">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`py-2 px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 ${
                    activeStepIndex === idx
                      ? 'bg-gradient-to-r from-[var(--k-hot)] to-[var(--k-hot-deep)] text-white shadow-md'
                      : 'text-[var(--k-ink-4)] hover:text-white hover:bg-[var(--k-surface-2)]'
                  }`}
                >
                  <span className="truncate">{s.title}</span>
                </button>
              ))}
            </div>

            {/* ADIM SAHNESİ (DİNAMİK KAYDIRMALI GEÇİŞ EFEKTİ) */}
            <div className="key-stage min-h-[175px] bg-gradient-to-b from-[var(--k-surface)] to-[var(--k-void)] p-5 rounded-2xl border border-[var(--k-line-2)] flex flex-col justify-between relative overflow-hidden transition-all duration-500 animate-in fade-in zoom-in-95">
              
              {/* Adım Başlığı & Rozeti */}
              <div className="flex items-center justify-between border-b border-[var(--k-line-2)] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${activeStep.color} flex items-center justify-center text-white shadow-md`}>
                    <StepIcon size={18} />
                  </div>
                  <span className="text-xs sm:text-sm font-black text-white">{activeStep.heading}</span>
                </div>
                <span className="text-[9px] font-black text-[var(--k-hot)] bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)] px-2.5 py-0.5 rounded-full">
                  {activeStep.badge}
                </span>
              </div>

              {/* Adım Açıklaması */}
              <p className="text-xs text-[var(--k-ink-3)] font-medium leading-relaxed my-2">
                {activeStep.description}
              </p>

              {/* İstatistik Metriği */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--k-line-2)] text-xs">
                <span className="font-bold text-[var(--k-ink-4)]">{activeStep.statLabel}:</span>
                <span className="font-black text-[var(--k-hot)] text-sm">{activeStep.statValue}</span>
              </div>

            </div>

            {/* İHALE GÜVENCE GARANTİSİ MADDELERİ */}
            <div className="pt-2 border-t border-[var(--k-line-2)] space-y-2 text-xs font-semibold text-[var(--k-ink-2)]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--k-hot)]">İHALE GÜVENCE GARANTİSİ:</span>
                <ShieldCheck size={16} className="text-[var(--k-hot)]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] sm:text-[11px]">
                <div className="flex items-center gap-1.5 bg-[var(--k-surface)] p-2 rounded-lg border border-[var(--k-line-2)]">
                  <CheckCircle2 size={13} className="text-[var(--k-hot)] shrink-0" />
                  <span className="leading-tight">Komisyon Yok (%0 Kesinti)</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--k-surface)] p-2 rounded-lg border border-[var(--k-line-2)]">
                  <CheckCircle2 size={13} className="text-[var(--k-hot)] shrink-0" />
                  <span className="leading-tight">En Yüksek Fiyat Garantisi</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[var(--k-surface)] p-2 rounded-lg border border-[var(--k-line-2)]">
                  <CheckCircle2 size={13} className="text-[var(--k-hot)] shrink-0" />
                  <span className="leading-tight">15 Dk Anında Ödeme</span>
                </div>
              </div>
            </div>

            {/* WOW ETKİLİ ANA DÖNÜŞÜM BUTONU */}
            <div className="pt-1">
              <Link
                href="/sell"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-[var(--k-hot-glow)] flex items-center justify-center gap-2 text-center hover:scale-[1.02] active:scale-98"
              >
                <Zap size={16} className="fill-white shrink-0" />
                <span>Cihazını İhaleye Çıkar (En Yüksek Fiyatı Al)</span>
                <ChevronRight size={16} strokeWidth={2.5} className="shrink-0" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
