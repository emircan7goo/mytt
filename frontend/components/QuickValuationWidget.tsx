'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Store, Truck, Lock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

export default function QuickValuationWidget() {
  const [samplePrice, setSamplePrice] = useState(35000);
  const [isPulsing, setIsPulsing] = useState(false);

  // Fiyat yükselme ve neon glow animasyon döngüsü (Tamamen Temsili Kavramsal Gösterim)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setSamplePrice((prev) => (prev >= 42000 ? 35000 : prev + 750));
      setTimeout(() => setIsPulsing(false), 800);
    }, 3000);

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

        {/* Sağ Taraf: TEMSİLİ ÖRNEK İHALE ÇALIŞMA MANTIĞI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-[var(--k-void)] p-5 sm:p-7 text-white text-left space-y-4 shadow-2xl relative overflow-hidden border border-[var(--k-hot-deep)]/50 group">
            
            {/* Arka Plan Glow Efekti */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[var(--k-hot)]/10 blur-3xl pointer-events-none" />

            {/* Üst Başlık: Temsili Örnek İhale Sistemi */}
            <div className="flex items-center justify-between border-b border-[var(--k-line-2)] pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs font-black text-[var(--k-hot)]">
                <Sparkles size={16} className="text-[var(--k-hot)]" />
                <span className="uppercase tracking-wider">İHALE ÇALIŞMA MANTIĞI (TEMSİLİ GÖSTERİM)</span>
              </div>
              <span className="text-[10px] font-bold text-[var(--k-ink-4)] bg-[var(--k-surface)] px-2.5 py-1 rounded-full border border-[var(--k-line-2)]">
                Örnek Akış
              </span>
            </div>

            {/* TEMSİLİ FİYAT YÜKSELME ANİMASYON ALANI */}
            <div className="py-3 text-center bg-gradient-to-b from-[var(--k-surface)] to-[var(--k-void)] p-5 rounded-2xl border border-[var(--k-line-2)] space-y-2 relative overflow-hidden">
              <div className="text-[11px] font-bold text-[var(--k-ink-4)] uppercase tracking-widest">
                BAYİLER BİRBİRİYLE YARIŞTIKÇA TEKLİF YÜKSELİR
              </div>

              {/* Rakam Parlama & Yükselme Animasyonu */}
              <div className={`text-3xl sm:text-5xl font-black text-white tracking-tight transition-all duration-300 ${isPulsing ? 'scale-108 text-[var(--k-hot-2)] drop-shadow-[0_0_25px_rgba(255,96,0,0.8)]' : 'drop-shadow-[0_0_15px_rgba(255,96,0,0.3)]'}`}>
                {formatTL(samplePrice)} <span className="text-xl sm:text-3xl text-[var(--k-hot)]">₺</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-white bg-[var(--k-hot-deep)] border border-[var(--k-hot-deep)]/40 px-3.5 py-1 rounded-full shadow-md">
                <TrendingUp size={13} className="text-white" />
                <span>+ Teklif Geldikçe Fiyat Yukarı Tırmanır</span>
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-[var(--k-hot-glow)] flex items-center justify-center gap-2 text-center hover:scale-[1.02] active:scale-98"
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
