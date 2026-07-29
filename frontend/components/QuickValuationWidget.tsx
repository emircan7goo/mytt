'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, Trophy, Clock, TrendingUp } from 'lucide-react';

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
    <div className="w-full max-w-full rounded-2xl sm:rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-10 shadow-2xl relative overflow-hidden my-4 sm:my-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center relative z-10 min-w-0">

        {/* Sol taraf: Başlık & Model Seçim Butonları */}
        <div className="lg:col-span-7 text-left space-y-2 sm:space-y-4 min-w-0">
          
          <h3 className="text-base sm:text-3xl lg:text-4xl font-black text-white leading-tight break-words">
            Cihazını İhaleye Çıkar, <span className="text-orange-400">Yetkili Bayiler En Yüksek Fiyat İçin Yarışsın!</span>
          </h3>

          <p className="text-xs sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl break-words">
            Cihaz modelini seç, kapalı açık artırma ihalesinde canlı fiyatların nasıl yükseldiğini incele.
          </p>

          {/* Model Seçim Çipleri */}
          <div className="pt-1 flex flex-wrap gap-1.5 sm:gap-2.5 max-w-full overflow-hidden">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModelKey(modelKey)}
                className={`px-2.5 py-1.5 sm:px-4.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all duration-300 border shrink-0 ${
                  selectedModelKey === modelKey
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white border-orange-500 shadow-md shadow-orange-500/30'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: LÜKS OBSİDYEN CANLI SKOR KARTI (Bağıran Turuncu Yerine Şık Koyu Mat) */}
        <div className="lg:col-span-5 min-w-0 w-full">
          <div className="rounded-2xl sm:rounded-3xl bg-slate-950 p-4 sm:p-7 text-white text-center space-y-3 sm:space-y-4 shadow-2xl relative overflow-hidden border border-orange-500/40 max-w-full">
            
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 sm:pb-3 flex-wrap">
              <div className="flex items-center gap-1 text-[11px] sm:text-xs font-black text-orange-400">
                <Trophy size={14} className="text-amber-400 sm:w-4 sm:h-4" />
                <span>CANLI EN YÜKSEK TEKLİF</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-slate-300 bg-slate-900 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-slate-800">
                <Clock size={11} className="text-orange-400" />
                <span>Kalan: {formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Dijital Slot Artış Animasyonu (Neon Orange Fiyat Vurgusu) */}
            <div className="py-1 space-y-0.5">
              <div className="text-[10px] sm:text-xs font-black text-orange-400 uppercase tracking-widest truncate">
                {currentPreset.modelName}
              </div>
              
              <div className={`text-3xl sm:text-5xl font-black text-white tracking-tight transition-transform duration-300 drop-shadow-[0_0_25px_rgba(255,96,0,0.5)] ${isTickActive ? 'scale-105' : ''}`}>
                {fmt(currentBid)} <span className="text-xl sm:text-3xl text-orange-400">₺</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-amber-300 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full mt-1">
                <TrendingUp size={13} className="text-orange-400" />
                <span>{bidsCount} Yetkili Bayi Teklif Verdi</span>
              </div>
            </div>

            {/* Anlık Bayi Akış Bandı */}
            <div className="bg-slate-900 rounded-xl p-2.5 text-[10px] sm:text-xs font-extrabold text-slate-200 border border-slate-800 shadow-xs truncate">
              {recentDealerText}
            </div>

            {/* Lüks Turuncu Aksiyon Butonu */}
            <Link
              href={`/sell?model=${encodeURIComponent(selectedModelKey)}`}
              className="w-full py-2.5 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98 max-w-full"
            >
              <Zap size={16} className="fill-white text-white shrink-0" />
              <span className="truncate">Cihazımı Bu Fiyata İhaleye Çıkar</span>
              <ArrowRight size={16} strokeWidth={3} className="shrink-0" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
