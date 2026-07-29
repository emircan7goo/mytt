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
  const [timerSeconds, setTimerSeconds] = useState(2868);
  const [isTickActive, setIsTickActive] = useState(false);

  useEffect(() => {
    setCurrentBid(currentPreset.basePrice);
    setBidsCount(17 + Math.floor(Math.random() * 5));
    setRecentDealerText(`🚀 ${DEALER_NAMES[0]} → +600 ₺ teklif yükseltti!`);
  }, [selectedModelKey]);

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
    <div className="w-full max-w-full rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-orange-300 p-5 sm:p-8 md:p-10 shadow-2xl shadow-orange-950/10 relative overflow-hidden my-6">
      {/* Arka plan radyal turuncu ışıklar */}
      <div className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-orange-500/15 blur-3xl animate-pulse" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10 min-w-0">

        {/* Sol taraf: Başlık & Model Seçim Butonları */}
        <div className="lg:col-span-7 text-left space-y-4 min-w-0">
          
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight break-words">
            Cihazını İhaleye Çıkar, <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">Yetkili Bayiler En Yüksek Fiyat İçin Yarışsın!</span>
          </h3>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl break-words">
            Cihaz modelini seç, kapalı açık artırma ihalesinde bayilerin teklifleri nasıl yükselttiğini aşağıdaki canlı örnekte incele.
          </p>

          {/* Model Seçim Çipleri (Taşmasız Esnek Izgara) */}
          <div className="pt-2 flex flex-wrap gap-2 sm:gap-2.5 max-w-full overflow-hidden">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModelKey(modelKey)}
                className={`px-3.5 py-2.5 sm:px-4.5 sm:py-3 rounded-2xl text-xs font-black transition-all duration-300 border shrink-0 ${
                  selectedModelKey === modelKey
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-105'
                    : 'bg-orange-50/50 text-slate-800 border-orange-200 hover:bg-orange-100 hover:text-orange-900'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: CANLI AÇIK ARTIRMA SKOR TABLOSU */}
        <div className="lg:col-span-5 min-w-0 w-full">
          <div className="rounded-3xl bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 p-6 sm:p-7 text-white text-center space-y-5 shadow-2xl shadow-orange-600/35 relative overflow-hidden border border-orange-400 max-w-full">
            
            <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-black text-white">
                <Trophy size={18} className="text-amber-200" />
                <span>CANLI EN YÜKSEK TEKLİF</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-100 bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                <Clock size={13} />
                <span>Kalan: {formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Dijital Matrix/Slot Artış Animasyonu */}
            <div className="py-2 space-y-1">
              <div className="text-xs font-black text-orange-100 uppercase tracking-widest truncate">
                {currentPreset.modelName}
              </div>
              
              <div className={`text-3xl sm:text-5xl font-black text-white tracking-tight transition-transform duration-300 ${isTickActive ? 'scale-105 drop-shadow-[0_0_20px_rgba(255,255,255,0.9)]' : ''}`}>
                {fmt(currentBid)} <span className="text-xl sm:text-2xl text-amber-200">₺</span>
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-black text-amber-100 bg-black/20 px-3.5 py-1.5 rounded-full mt-2">
                <TrendingUp size={15} className="text-amber-300" />
                <span>{bidsCount} Yetkili Bayi Teklif Verdi</span>
              </div>
            </div>

            {/* Anlık Bayi Akış Bandı */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 text-xs font-extrabold text-white border border-white/20 shadow-md overflow-hidden">
              <div className="truncate">
                {recentDealerText}
              </div>
            </div>

            <Link
              href={`/sell?model=${encodeURIComponent(selectedModelKey)}`}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 font-black text-xs sm:text-sm transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 max-w-full"
            >
              <Zap size={18} className="fill-orange-600 text-orange-600 shrink-0" />
              <span className="truncate">Cihazımı Bu Fiyata İhaleye Çıkar</span>
              <ArrowRight size={18} strokeWidth={3} className="shrink-0" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
