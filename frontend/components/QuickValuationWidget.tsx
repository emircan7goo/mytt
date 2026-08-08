'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Store, Truck, Lock, TrendingUp } from 'lucide-react';

export default function QuickValuationWidget() {
  const [demoPrice, setDemoPrice] = useState(42500);
  const [isBumping, setIsBumping] = useState(false);

  // Subtle natural price bump ticker without noisy simulation text
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBumping(true);
      setDemoPrice((prev) => (prev >= 49000 ? 42500 : prev + 650));
      setTimeout(() => setIsBumping(false), 600);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const formatTL = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-full rounded-3xl bg-[#111625] border border-white/10 p-5 sm:p-8 shadow-xl relative overflow-hidden my-4 sm:my-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Öz ve Net Metin */}
        <div className="lg:col-span-6 text-left space-y-3.5 sm:space-y-5 min-w-0">
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
            Fiyatı Algoritma Değil, <br />
            <span className="text-[#FF6000]">İşini Bilen Telefoncu Versin!</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            Cihazını 1 dakikada teklife çıkar. Türkiye'nin 150+ onaylı yetkili telefoncu bayisi canlı kapalı ihalede teklif versin. En yüksek teklifi sen seç, paran %100 Escrow korumasıyla anında hesabına yatsın.
          </p>

          {/* 3 Temel Rozet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Store size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-xs font-bold text-slate-200">150+ Onaylı Bayi Yarışır</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Truck size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-xs font-bold text-slate-200">Ücretsiz Kapıdan Kurye</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Lock size={16} className="text-[#FF6000] shrink-0" />
              <span className="text-xs font-bold text-slate-200">%100 BDDK Escrow Güvencesi</span>
            </div>
          </div>

          {/* Aksiyon Butonu */}
          <div className="pt-1">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#FF6000] hover:bg-[#EA580C] text-white font-black text-xs sm:text-sm transition-all shadow-lg shadow-[#FF6000]/20 hover:scale-[1.01] active:scale-98"
            >
              <span>Cihazını İhaleye Çıkar & Teklif Al</span>
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

        {/* Sağ Taraf: ULTRA MİNİMAL CANLI FİYAT KARTI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className="rounded-2xl bg-[#0b0f19] p-6 sm:p-8 text-white text-left space-y-5 border border-white/10 shadow-xl flex flex-col justify-center">
            
            {/* MİNİMAL FİYAT GÖSTERİMİ */}
            <div className="py-6 text-center bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                150+ BAYİ KAPALI İHALEDE YARIŞTIKÇA TEKLİF YÜKSELİR
              </div>

              <div className={`text-4xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
                isBumping ? 'scale-105 text-[#FF6000]' : 'text-white'
              }`}>
                {formatTL(demoPrice)} <span className="text-2xl sm:text-4xl text-[#FF6000]">₺</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full">
                <TrendingUp size={14} />
                <span>+ Teklif Geldikçe Fiyat Anında Yukarı Çarpar</span>
              </div>
            </div>

            {/* CTA BUTONU */}
            <div>
              <Link
                href="/sell"
                className="w-full py-4 rounded-xl bg-[#FF6000] hover:bg-[#EA580C] text-white font-black text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 text-center"
              >
                <span>Cihazını İhaleye Çıkar & En Yüksek Teklifi Al</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
