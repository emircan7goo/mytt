'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, ShieldCheck, Zap, Store, Truck, Lock, CheckCircle2, 
  TrendingUp, Sparkles, Smartphone, Flame, DollarSign, Award, RefreshCw 
} from 'lucide-react';

const RECENT_BIDS_MOCK = [
  { dealer: 'MYTT Kadıköy Yetkili Bayii', bump: 750, location: 'İstanbul' },
  { dealer: 'MYTT Şişli Ana Bayi', bump: 1200, location: 'İstanbul' },
  { dealer: 'MYTT Çankaya Bayii', bump: 500, location: 'Ankara' },
  { dealer: 'MYTT Konak Bayii', bump: 950, location: 'İzmir' },
  { dealer: 'MYTT Bursa Nilüfer Bayii', bump: 800, location: 'Bursa' },
];

const DEVICE_PROMPTS = [
  'iPhone, Samsung, Xiaomi & Tüm Modeller',
  'Sıfır Kutulu veya İkinci El Cihazınız',
  '150+ Onaylı Bayi Canlı Yarışır',
];

export default function QuickValuationWidget() {
  const [demoPrice, setDemoPrice] = useState(38400);
  const [isSlamming, setIsSlamming] = useState(false);
  const [lastBid, setLastBid] = useState(RECENT_BIDS_MOCK[0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [bidCount, setBidCount] = useState(14);

  // Live Auction Bidding Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      const randomBid = RECENT_BIDS_MOCK[Math.floor(Math.random() * RECENT_BIDS_MOCK.length)];
      setLastBid(randomBid);
      setIsSlamming(true);
      setBidCount((prev) => prev + 1);

      setDemoPrice((prev) => (prev >= 48500 ? 38400 : prev + randomBid.bump));

      setTimeout(() => setIsSlamming(false), 850);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Text ticker cycling
  useEffect(() => {
    const textTimer = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % DEVICE_PROMPTS.length);
    }, 4000);
    return () => clearInterval(textTimer);
  }, []);

  const formatTL = (val: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-full rounded-3xl bg-[#0b0f19] border border-white/10 p-5 sm:p-10 shadow-2xl relative overflow-hidden my-6 sm:my-10 backdrop-blur-2xl">
      
      {/* Background Neon Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FF6000]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 min-w-0">

        {/* Sol Taraf: Değer Önermesi & Özellikler */}
        <div className="lg:col-span-6 text-left space-y-4 sm:space-y-6 min-w-0">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6000]/15 border border-[#FF6000]/30 text-[#FF6000] text-xs font-black tracking-wide shadow-md shadow-[#FF6000]/10">
            <Zap size={15} className="fill-[#FF6000] animate-pulse" />
            <span>ARADA KOMİSYONCU YOK • DOĞRUDAN ESNAF TİCARETİ</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
            Fiyatı Algoritma Değil, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#FF6000] via-[#FF7A00] to-[#EA580C] bg-clip-text text-transparent">
              İşini Bilen Telefoncu Versin!
            </span>
          </h2>

          <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
            Cihazını 1 dakikada teklife çıkar. Türkiye'nin 150+ onaylı yetkili telefoncu bayisi canlı kapalı ihalede teklif versin. En yüksek teklifi sen seç, paran %100 Escrow korumasıyla anında hesabına yatsın.
          </p>

          {/* 3 Özellik Rozeti */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Store size={20} className="text-[#FF6000] shrink-0" />
              <div className="text-xs font-bold text-white leading-tight">
                150+ Onaylı Bayi Yarışır
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Truck size={20} className="text-[#FF6000] shrink-0" />
              <div className="text-xs font-bold text-white leading-tight">
                Ücretsiz Kapıdan Kurye
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Lock size={20} className="text-[#FF6000] shrink-0" />
              <div className="text-xs font-bold text-white leading-tight">
                %100 BDDK Escrow Güvencesi
              </div>
            </div>
          </div>

          {/* Sol Aksiyon Butonu */}
          <div className="pt-2">
            <Link
              href="/sell"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-[#FF6000]/30 hover:scale-[1.02] active:scale-98 border border-orange-400/30"
            >
              <span>Cihazını İhaleye Çıkar & Teklif Al</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>

        </div>

        {/* Sağ Taraf: ULTRA DİNAMİK CANLI İHALE SİMÜLATÖRÜ KARTI */}
        <div className="lg:col-span-6 min-w-0 w-full">
          <div className={`rounded-3xl bg-[#111625] p-6 sm:p-8 text-white text-left space-y-5 shadow-2xl relative overflow-hidden transition-all duration-300 border ${
            isSlamming 
              ? 'border-[#FF6000] shadow-[0_0_50px_rgba(255,96,0,0.5)] scale-[1.01]' 
              : 'border-white/10'
          }`}>
            
            {/* Üst Canlı Simülasyon Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-black text-white uppercase tracking-wider">CANLI İHALE SİMÜLATÖRÜ</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Flame size={13} className="fill-emerald-400" />
                  <span>{bidCount} Canlı Teklif Verildi</span>
                </span>
              </div>
            </div>

            {/* Dinamik Model / İhale Etiketi Switcher */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs text-slate-300 font-bold truncate">
                <Smartphone size={16} className="text-[#FF6000] shrink-0" />
                <span className="truncate transition-all duration-300 text-white font-black">{DEVICE_PROMPTS[promptIdx]}</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md shrink-0">
                Canlı Yarışma
              </span>
            </div>

            {/* CANLI FİYAT YÜKSELME & SAĞDAN SLAM TEKLİF ALANI */}
            <div className="py-5 text-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 space-y-3.5 relative overflow-hidden shadow-inner">
              
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles size={14} className="text-[#FF6000] animate-spin" />
                <span>150+ BAYİ KAPALI İHALEDE YARIŞTIKÇA TEKLİF YÜKSELİR</span>
              </div>

              {/* FİYAT ARTIŞI & CANLI SLAM ROZETİ */}
              <div className="relative flex flex-col items-center justify-center min-h-[85px]">
                
                {/* Canlı Bayi Teklifi Pop-up Rozeti */}
                {isSlamming && (
                  <div className="absolute -top-1 right-2 sm:right-4 animate-in slide-in-from-right-16 fade-in duration-300 z-30 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-xs px-3.5 py-1.5 rounded-xl shadow-xl shadow-emerald-500/40 border border-emerald-300 flex items-center gap-1.5">
                    <TrendingUp size={15} className="animate-bounce" />
                    <span>{lastBid.dealer}: +{formatTL(lastBid.bump)} ₺</span>
                  </div>
                )}

                <div className={`text-4xl sm:text-6xl font-black tracking-tight transition-all duration-300 ${
                  isSlamming 
                    ? 'scale-110 text-[#FF6000] drop-shadow-[0_0_35px_rgba(255,96,0,0.95)]' 
                    : 'text-white drop-shadow-[0_0_20px_rgba(255,96,0,0.3)]'
                }`}>
                  {formatTL(demoPrice)} <span className="text-2xl sm:text-4xl text-[#FF6000]">₺</span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full shadow-md">
                <TrendingUp size={14} />
                <span>+ Teklif Geldikçe Fiyat Anında Yukarı Çarpar</span>
              </div>
            </div>

            {/* İHALE GÜVENCE GARANTİSİ MADDELERİ */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-[#FF6000] tracking-wider uppercase flex items-center gap-1.5">
                  <ShieldCheck size={16} /> İHALE GÜVENCE GARANTİSİ
                </span>
                <span className="text-[10px] text-slate-400 font-bold">%100 Güvenli Ticaret</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold">
                <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="leading-tight">Komisyon Yok (%0 Kesinti)</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="leading-tight">En Yüksek Fiyat Garantisi</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span className="leading-tight">15 Dk Anında Ödeme</span>
                </div>
              </div>
            </div>

            {/* HIGH-IMPACT MAIN CTA BUTTON */}
            <div className="pt-1">
              <Link
                href="/sell"
                className="w-full py-4 sm:py-4.5 rounded-2xl bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-[#FF6000]/30 flex items-center justify-center gap-2 text-center hover:scale-[1.02] active:scale-98 border border-orange-400/30 group"
              >
                <Zap size={18} className="fill-white shrink-0 group-hover:rotate-12 transition-transform" />
                <span>Cihazını İhaleye Çıkar & En Yüksek Teklifi Al</span>
                <ArrowRight size={18} strokeWidth={2.5} className="shrink-0 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
