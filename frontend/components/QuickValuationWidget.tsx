'use client';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap, Store, Truck, Lock, CheckCircle2 } from 'lucide-react';

export default function QuickValuationWidget() {
  return (
    <div className="w-full max-w-full rounded-2xl sm:rounded-3xl bg-[var(--k-surface)] border border-[var(--k-line-2)] p-5 sm:p-10 shadow-2xl relative overflow-hidden my-4 sm:my-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Değer Önerisi & 4 Adımda Güvenli Satış */}
        <div className="lg:col-span-7 text-left space-y-3 sm:space-y-5 min-w-0">
          
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

          {/* Aksiyon Butonu */}
          <div className="pt-2">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-xs sm:text-base transition-all shadow-xl shadow-[var(--k-hot-glow)] hover:scale-[1.02] active:scale-98"
            >
              <span>Cihazını İhaleye Çıkar & Teklif Al</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

        {/* Sağ Taraf: Ekosistem Bilgi & Güvence Kartı */}
        <div className="lg:col-span-5 min-w-0 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-[var(--k-void)] p-5 sm:p-7 text-white text-left space-y-4 shadow-2xl relative overflow-hidden border border-[var(--k-hot-deep)]/40">
            
            <div className="flex items-center justify-between border-b border-[var(--k-line-2)] pb-3">
              <span className="text-xs font-black text-[var(--k-hot)] uppercase tracking-wider">İHALE GÜVENCE GARANTİSİ</span>
              <ShieldCheck size={18} className="text-[var(--k-hot)]" />
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-semibold text-[var(--k-ink-2)]">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--k-hot)] shrink-0 mt-0.5" />
                <span><strong>Komisyon & Kesinti Yok:</strong> Teklif edilen net tutarın tamamı hesabınıza yatırılır.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--k-hot)] shrink-0 mt-0.5" />
                <span><strong>En Yüksek Fiyat Garantisi:</strong> Bayiler birbirlerinin fiyatını görmeden rekabetçi teklif verir.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-[var(--k-hot)] shrink-0 mt-0.5" />
                <span><strong>Anında Ödeme:</strong> Ekspertiz onayından sonra paranız 15 dakika içinde hesabınızda.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--k-line-2)]">
              <Link
                href="/sell"
                className="w-full py-3 rounded-xl bg-[var(--k-surface-2)] hover:bg-[var(--k-hot-wash)] border border-[var(--k-line-2)] hover:border-[var(--k-line-hot)] text-[var(--k-ink)] hover:text-[var(--k-hot)] font-black text-xs transition-all flex items-center justify-center gap-2 text-center"
              >
                <span>Hemen Cihazının Değerini Öğren</span>
                <ArrowRight size={14} />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
