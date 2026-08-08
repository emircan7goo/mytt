'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Store, Truck, Lock, TrendingUp, Sparkles, Zap } from 'lucide-react';

export default function QuickValuationWidget() {
  const [demoPrice, setDemoPrice] = useState(44450);
  const [isBumping, setIsBumping] = useState(false);
  const [lastBump, setLastBump] = useState(750);

  // GOD-LEVEL dynamic price ticker & slamming animation
  useEffect(() => {
    const interval = setInterval(() => {
      const bumpAmounts = [650, 750, 900, 1150];
      const randomBump = bumpAmounts[Math.floor(Math.random() * bumpAmounts.length)];
      setLastBump(randomBump);
      setIsBumping(true);

      setDemoPrice((prev) => (prev >= 54000 ? 44450 : prev + randomBump));

      setTimeout(() => setIsBumping(false), 800);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  const formatTL = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-full rounded-2xl sm:rounded-3xl bg-[#111625] border border-white/10 p-4 sm:p-8 shadow-2xl relative overflow-hidden my-3 sm:my-6">
      
      {/* Background Neon Glowing Orbs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#FF6000]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Öz ve Net Metin */}
        <div className="lg:col-span-6 text-left space-y-3 sm:space-y-6 min-w-0">
          
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            Fiyatı Algoritma Değil, <br />
            <span className="bg-gradient-to-r from-[#FF6000] via-[#FF7A00] to-[#EA580C] bg-clip-text text-transparent">
              İşini Bilen Telefoncu Versin!
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            Cihazını 1 dakikada teklife çıkar. Türkiye'nin 150+ onaylı yetkili telefoncu bayisi canlı kapalı ihalede teklif versin. En yüksek teklifi sen seç, paran %100 Escrow korumasıyla anında hesabına yatsın.
          </p>

          {/* 3 Temel Rozet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Store size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-200">150+ Onaylı Bayi Yarışır</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Truck size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-200">Ücretsiz Kapıdan Kurye</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Lock size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-200">%100 BDDK Escrow Güvencesi</span>
            </div>
          </div>

        </div>

        {/* Sağ Taraf: GOD-LEVEL ANİMASYONLU MİNİMAL CANLI FİYAT KARTI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className={`rounded-2xl sm:rounded-3xl bg-[#0b0f19] p-4 sm:p-8 text-white text-left space-y-4 sm:space-y-6 border transition-all duration-300 shadow-2xl relative overflow-hidden flex flex-col justify-center ${
            isBumping 
              ? 'border-[#FF6000] shadow-[0_0_50px_rgba(255,96,0,0.5)] scale-[1.01]' 
              : 'border-white/10'
          }`}>
            
            {/* GOD-LEVEL FİYAT ANİMASYON ALANI */}
            <div className="py-4 sm:py-7 text-center bg-slate-900/90 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-800 space-y-3 relative overflow-hidden shadow-inner">
              
              <div className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-[#FF6000] animate-spin" />
                <span>150+ BAYİ KAPALI İHALEDE YARIŞTIKÇA TEKLİF YÜKSELİR</span>
              </div>

              {/* SAĞDAN FIRLAYAN İHALE TEKLİF PATLAMASI & RAKAM YÜKSELİŞİ */}
              <div className="relative flex flex-col items-center justify-center min-h-[70px] sm:min-h-[90px]">
                
                {isBumping && (
                  <div className="absolute -top-2 right-1 sm:right-6 animate-in slide-in-from-right-16 fade-in duration-300 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xl stroke-emerald-500/40 border border-emerald-300 flex items-center gap-1">
                    <TrendingUp size={13} className="animate-bounce" />
                    <span>+{formatTL(lastBump)} ₺ CANLI TEKLİF!</span>
                  </div>
                )}

                <div className={`text-3xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
                  isBumping 
                    ? 'scale-110 text-[#FF6000] drop-shadow-[0_0_40px_rgba(255,96,0,0.95)]' 
                    : 'text-white drop-shadow-[0_0_20px_rgba(255,96,0,0.3)]'
                }`}>
                  {formatTL(demoPrice)} <span className="text-xl sm:text-4xl text-[#FF6000]">₺</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-md">
                <TrendingUp size={12} />
                <span>+ Teklif Geldikçe Fiyat Anında Yukarı Çıkar</span>
              </div>
            </div>

            {/* TEK VE GÜÇLÜ CTA BUTONU */}
            <div>
              <Link
                href="/sell"
                className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-[#FF6000]/30 flex items-center justify-center gap-2.5 text-center hover:scale-[1.02] active:scale-98 border border-orange-400/30 group"
              >
                <Zap size={18} className="fill-white shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Cihazını İhaleye Çıkar & Teklif Al</span>
                <ArrowRight size={18} strokeWidth={2.5} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
