'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, Flame, Clock, Trophy, TrendingUp, Sparkles } from 'lucide-react';

interface PresetModel {
  basePrice: number;
  modelName: string;
}

const PRESET_MODELS: Record<string, PresetModel> = {
  'iPhone 15 Pro Max (256GB)': { basePrice: 52000, modelName: 'iPhone 15 Pro Max (256GB)' },
  'iPhone 14 Pro (128GB)': { basePrice: 40000, modelName: 'iPhone 14 Pro (128GB)' },
  'iPhone 13 (128GB)': { basePrice: 26500, modelName: 'iPhone 13 (128GB)' },
  'Galaxy S24 Ultra (512GB)': { basePrice: 49500, modelName: 'Galaxy S24 Ultra (512GB)' },
  'Galaxy S23 (128GB)': { basePrice: 22500, modelName: 'Galaxy S23 (128GB)' },
};

const DEALER_NAMES = [
  'Nilüfer Cihaz Pazarı #89',
  'Kadıköy Yetkili Bayi #42',
  'Şişli Premium Bayi #18',
  'Beşiktaş Kurumsal Bayi #07',
  'Çankaya Onaylı Bayi #55',
  'Karşıyaka Yetkili Bayi #23',
];

export default function QuickValuationWidget() {
  const [selectedModelKey, setSelectedModelKey] = useState('iPhone 14 Pro (128GB)');
  const currentPreset = PRESET_MODELS[selectedModelKey] || PRESET_MODELS['iPhone 14 Pro (128GB)'];

  const [currentBid, setCurrentBid] = useState(currentPreset.basePrice);
  const [bidsCount, setBidsCount] = useState(19);
  const [recentDealerText, setRecentDealerText] = useState('🚀 Nilüfer Cihaz Pazarı #89 → +600 ₺ teklif yükseltti!');
  const [timerSeconds, setTimerSeconds] = useState(2868); // 47 dk 48 sn
  const [isTickActive, setIsTickActive] = useState(false);

  useEffect(() => {
    setCurrentBid(currentPreset.basePrice);
    setBidsCount(17 + Math.floor(Math.random() * 5));
    setRecentDealerText(`🚀 ${DEALER_NAMES[0]} → +600 ₺ teklif yükseltti!`);
  }, [selectedModelKey]);

  // Şık Dijital Matrix/Slot Artış Animasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = (Math.floor(Math.random() * 4) + 1) * 150;
      setIsTickActive(true);
      setCurrentBid((prev) => prev + increment);
      setBidsCount((prev) => prev + 1);

      const randomDealer = DEALER_NAMES[Math.floor(Math.random() * DEALER_NAMES.length)];
      setRecentDealerText(`🚀 ${randomDealer} → +${increment} ₺ teklif yükseltti!`);

      setTimeout(() => setIsTickActive(false), 800);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 2868));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} dk ${s < 10 ? '0' : ''}${s} sn`;
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="w-full rounded-3xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 p-6 md:p-10 shadow-2xl shadow-slate-900/5 relative overflow-hidden my-6">
      {/* Arka plan yumuşak radyal ışıklar */}
      <div className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 -bottom-24 w-[420px] h-[420px] rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Sol taraf: Başlık & Model Seçim Butonları */}
        <div className="lg:col-span-7 text-left space-y-4">
          
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            Cihazını İhaleye Çıkar, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 bg-clip-text text-transparent">Yetkili Bayiler En Yüksek Fiyat İçin Yarışsın!</span>
          </h3>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Cihaz modelini seç, kapalı açık artırma ihalesinde bayilerin teklifleri nasıl yükselttiğini aşağıdaki canlı örnekte incele.
          </p>

          {/* Model Seçim Çipleri */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModelKey(modelKey)}
                className={`px-4.5 py-3 rounded-2xl text-xs font-black transition-all duration-300 border ${
                  selectedModelKey === modelKey
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/30 scale-105'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: LÜKS DİJİTAL AÇIK ARTIRMA SKOR TABLOSU (TEMSİLİ ÖRNEK) */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-slate-950 p-7 text-white text-center space-y-5 shadow-2xl shadow-slate-950/20 relative overflow-hidden border border-slate-800">
            
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-white">
                <Trophy size={18} className="text-amber-400" />
                <span>CANLI EN YÜKSEK TEKLİF</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                <Clock size={13} />
                <span>Kalan: {formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Dijital Matrix/Slot Artış Animasyonu */}
            <div className="py-2 space-y-1">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                {currentPreset.modelName}
              </div>
              
              <div className={`text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight transition-transform duration-300 ${isTickActive ? 'scale-110 text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]' : ''}`}>
                {fmt(currentBid)} <span className="text-2xl text-emerald-300">₺</span>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-black text-slate-300 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800 mt-2">
                <TrendingUp size={15} className="text-emerald-400" />
                <span>{bidsCount} Yetkili Bayi Teklif Verdi</span>
              </div>
            </div>

            {/* Anlık Bayi Akış Bandı */}
            <div className="bg-slate-900 rounded-2xl p-3.5 text-xs font-extrabold text-slate-200 border border-slate-800 shadow-inner">
              <div className="truncate">
                {recentDealerText}
              </div>
            </div>

            <Link
              href={`/sell?model=${encodeURIComponent(selectedModelKey)}`}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <Zap size={18} className="fill-slate-950 text-slate-950" />
              <span>Cihazımı Bu Fiyata İhaleye Çıkar</span>
              <ArrowRight size={18} strokeWidth={3} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
