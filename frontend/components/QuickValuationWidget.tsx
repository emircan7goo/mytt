'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Store, Truck, Lock, TrendingUp, Sparkles, Zap } from 'lucide-react';

export default function QuickValuationWidget() {
  const [demoPrice, setDemoPrice] = useState(45200);
  const [isBumping, setIsBumping] = useState(false);
  const [lastBump, setLastBump] = useState(750);

  // GOD-LEVEL dynamic price ticker & slamming animation
  useEffect(() => {
    const interval = setInterval(() => {
      const bumpAmounts = [650, 750, 900, 1150];
      const randomBump = bumpAmounts[Math.floor(Math.random() * bumpAmounts.length)];
      setLastBump(randomBump);
      setIsBumping(true);

      setDemoPrice((prev) => (prev >= 54000 ? 45200 : prev + randomBump));

      setTimeout(() => setIsBumping(false), 800);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const formatTL = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-full rounded-xl sm:rounded-3xl bg-[#111625] border border-white/10 p-3.5 sm:p-8 shadow-2xl relative overflow-hidden my-2.5 sm:my-6">
      
      {/* Background Neon Glowing Orbs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FF6000]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-8 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Öz ve Net Metin (Mobilde Ultra Minimal) */}
        <div className="lg:col-span-6 text-left space-y-2 sm:space-y-6 min-w-0">
          
          <h2 className="text-base sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            Fiyatı Algoritma Değil, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FF6000] via-[#FF7A00] to-[#EA580C] bg-clip-text text-transparent">
              İşini Bilen Telefoncu Versin!
            </span>
          </h2>

          <p className="hidden sm:block text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            Cihazını 1 dakikada teklife çıkar. Türkiye'nin 150+ onaylı yetkili telefoncu bayisi canlı kapalı ihalede teklif versin. En yüksek teklifi sen seç, paran %100 Escrow korumasıyla anında hesabına yatsın.
          </p>

          {/* 3 Temel Rozet — Mobilde Sıkıştırılmış Satır */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 pt-0.5 sm:pt-1">
            <div className="flex items-center gap-1.5 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Store size={14} className="text-[#FF6000] shrink-0" />
              <span className="text-[9px] sm:text-xs font-bold text-slate-200 truncate">150+ Bayi</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Truck size={14} className="text-[#FF6000] shrink-0" />
              <span className="text-[9px] sm:text-xs font-bold text-slate-200 truncate">Ücretsiz Kurye</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 sm:p-3 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Lock size={14} className="text-[#FF6000] shrink-0" />
              <span className="text-[9px] sm:text-xs font-bold text-slate-200 truncate">%100 Escrow</span>
            </div>
          </div>

        </div>

        {/* Sağ Taraf: ULTRA MİNİMAL CANLI FİYAT KARTI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className={`rounded-xl sm:rounded-3xl bg-[#0b0f19] p-3 sm:p-8 text-white text-left space-y-3 sm:space-y-6 border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-center ${
            isBumping 
              ? 'border-[#FF6000] shadow-[0_0_40px_rgba(255,96,0,0.4)]' 
              : 'border-white/10'
          }`}>
            
            {/* FİYAT ANİMASYON ALANI */}
            <div className="py-2.5 sm:py-7 text-center bg-slate-900/90 p-3 sm:p-6 rounded-lg sm:rounded-2xl border border-slate-800 space-y-2 relative overflow-hidden shadow-inner">
              
              <div className="text-[8px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles size={11} className="text-[#FF6000] animate-spin" />
                <span>150+ BAYİ KAPALI İHALEDE YARIŞTIKÇA TEKLİF YÜKSELİR</span>
              </div>

              {/* TEKLİF PATLAMASI & RAKAM YÜKSELİŞİ */}
              <div className="relative flex flex-col items-center justify-center min-h-[50px] sm:min-h-[90px]">
                
                {isBumping && (
                  <div className="absolute -top-2 right-1 sm:right-6 animate-in slide-in-from-right-16 fade-in duration-300 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[9px] sm:text-xs px-2 py-0.5 sm:px-3.5 sm:py-1.5 rounded-md sm:rounded-xl shadow-lg border border-emerald-300 flex items-center gap-1">
                    <TrendingUp size={12} className="animate-bounce" />
                    <span>+{formatTL(lastBump)} ₺ CANLI TEKLİF!</span>
                  </div>
                )}

                <div className={`text-2xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
                  isBumping 
                    ? 'scale-105 text-[#FF6000] drop-shadow-[0_0_30px_rgba(255,96,0,0.9)]' 
                    : 'text-white drop-shadow-[0_0_15px_rgba(255,96,0,0.3)]'
                }`}>
                  {formatTL(demoPrice)} <span className="text-lg sm:text-4xl text-[#FF6000]">₺</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 sm:px-4 sm:py-1.5 rounded-full shadow-md">
                <TrendingUp size={11} />
                <span>+ Teklif Geldikçe Fiyat Anında Yukarı Çıkar</span>
              </div>
            </div>

            {/* TEK VE GÜÇLÜ CTA BUTONU */}
            <div>
              <Link
                href="/sell"
                className="w-full py-2.5 sm:py-4.5 rounded-lg sm:rounded-2xl bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black text-xs sm:text-base transition-all shadow-lg shadow-[#FF6000]/30 flex items-center justify-center gap-2 text-center hover:scale-[1.01] active:scale-98 border border-orange-400/30 group"
              >
                <Zap size={15} className="fill-white shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Cihazını İhaleye Çıkar & Teklif Al</span>
                <ArrowRight size={15} strokeWidth={2.5} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
