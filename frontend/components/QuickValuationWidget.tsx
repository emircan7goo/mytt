'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Store, Truck, Lock, CheckCircle2, TrendingUp, Sparkles, Smartphone } from 'lucide-react';

export default function QuickValuationWidget() {
  const [demoPrice, setDemoPrice] = useState(36500);
  const [isSlamming, setIsSlamming] = useState(false);
  const [currentBump, setCurrentBump] = useState(500);

  // Sağdan Uçup Fiyata Çarpan Rakam Animasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      const bump = [450, 600, 750, 900][Math.floor(Math.random() * 4)];
      setCurrentBump(bump);
      setIsSlamming(true);

      setDemoPrice((prev) => (prev >= 44500 ? 36500 : prev + bump));

      setTimeout(() => setIsSlamming(false), 950);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const formatTL = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);

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

        {/* Sağ Taraf: SAĞDAN UÇAN RAKAM PATLAMALI CANLI İHALE ANİMASYON KARTI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className={`rounded-2xl sm:rounded-3xl bg-[var(--k-void)] p-5 sm:p-7 text-white text-left space-y-4 shadow-2xl relative overflow-hidden transition-all duration-300 border ${isSlamming ? 'border-[var(--k-hot)] shadow-[0_0_40px_rgba(255,96,0,0.6)] scale-[1.02]' : 'border-[var(--k-hot-deep)]/40'}`}>
            
            {/* Arka Plan Neonsal Parlama */}
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br from-[var(--k-hot)]/20 to-amber-500/10 blur-3xl pointer-events-none" />

            {/* Üst Başlık & Model Etiketi */}
            <div className="flex items-center justify-between border-b border-[var(--k-line-2)] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--k-hot)]">
                <Smartphone size={16} className="text-[var(--k-hot)]" />
                <span className="uppercase tracking-wider">TEMSİLİ İHALE ÖRNEĞİ (ÖRN. IPHONE 15 PRO)</span>
              </div>
              <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full">
                Örnek Akış
              </span>
            </div>

            {/* FİYAT YÜKSELME & SAĞDAN UÇAN RAKAM ANİMASYON ALANI */}
            <div className="py-4 text-center bg-gradient-to-b from-[var(--k-surface)] to-[var(--k-void)] p-5 rounded-2xl border border-[var(--k-line-2)] space-y-3 relative overflow-hidden shadow-inner">
              
              <div className="text-[11px] font-bold text-[var(--k-ink-3)] uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-[var(--k-hot)] animate-spin" />
                <span>150+ BAYİ KAPALI İHALEDE YARIŞTIKÇA TEKLİF YÜKSELİR</span>
              </div>

              {/* SAĞDAN UÇAN FİYAT ARTIŞ ROZETİ VE RAKAM PATLAMASI */}
              <div className="relative flex flex-col items-center justify-center min-h-[75px]">
                
                {/* Sağdan Fırlayan Rakam Rozeti */}
                {isSlamming && (
                  <div className="absolute top-0 right-2 sm:right-6 animate-in slide-in-from-right-12 fade-in duration-400 z-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs px-3.5 py-1 rounded-full shadow-lg shadow-emerald-500/40 border border-emerald-300 flex items-center gap-1.5">
                    <TrendingUp size={14} className="animate-bounce" />
                    <span>+{formatTL(currentBump)} ₺ TEKLİF YÜKSELDİ!</span>
                  </div>
                )}

                <div className={`text-4xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${isSlamming ? 'scale-115 text-[var(--k-hot-2)] drop-shadow-[0_0_35px_rgba(255,96,0,0.95)]' : 'text-white drop-shadow-[0_0_15px_rgba(255,96,0,0.3)]'}`}>
                  {formatTL(demoPrice)} <span className="text-2xl sm:text-4xl text-[var(--k-hot)]">₺</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-white bg-[var(--k-hot-deep)] border border-[var(--k-hot-deep)]/40 px-4 py-1.5 rounded-full shadow-md">
                <span>+ Teklif Geldikçe Fiyat Anında Yukarı Çarpar</span>
              </div>
            </div>

            {/* İHALE GÜVENCE GARANTİSİ MADDELERİ */}
            <div className="pt-2 border-t border-[var(--k-line-2)] space-y-2.5 text-xs font-semibold text-[var(--k-ink-2)]">
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
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-[var(--k-hot-glow)] flex items-center justify-center gap-2 text-center hover:scale-[1.02] active:scale-98"
              >
                <Zap size={16} className="fill-white shrink-0" />
                <span>Cihazını İhaleye Çıkar (En Yüksek Fiyatı Al)</span>
                <ArrowRight size={16} strokeWidth={2.5} className="shrink-0" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
