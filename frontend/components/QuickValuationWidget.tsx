'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, Flame, Clock, Trophy, TrendingUp } from 'lucide-react';

interface PresetModel {
  basePrice: number;
  modelName: string;
}

const PRESET_MODELS: Record<string, PresetModel> = {
  'iPhone 15 Pro Max (256GB)': { basePrice: 52000, modelName: 'iPhone 15 Pro Max (256GB)' },
  'iPhone 14 Pro (128GB)': { basePrice: 38200, modelName: 'iPhone 14 Pro (128GB)' },
  'iPhone 13 (128GB)': { basePrice: 24500, modelName: 'iPhone 13 (128GB)' },
  'Galaxy S24 Ultra (512GB)': { basePrice: 49500, modelName: 'Galaxy S24 Ultra (512GB)' },
  'Galaxy S23 (128GB)': { basePrice: 21200, modelName: 'Galaxy S23 (128GB)' },
};

const DEALER_NAMES = [
  'Kadıköy Yetkili Bayi #42',
  'Şişli Premium Bayi #18',
  'Beşiktaş Kurumsal Bayi #07',
  'Çankaya Onaylı Bayi #55',
  'Karşıyaka Yetkili Bayi #23',
  'Nilüfer Cihaz Pazarı #89',
];

export default function QuickValuationWidget() {
  const [selectedModelKey, setSelectedModelKey] = useState('iPhone 14 Pro (128GB)');
  const currentPreset = PRESET_MODELS[selectedModelKey] || PRESET_MODELS['iPhone 14 Pro (128GB)'];

  const [currentBid, setCurrentBid] = useState(currentPreset.basePrice);
  const [bidsCount, setBidsCount] = useState(14);
  const [recentDealerText, setRecentDealerText] = useState('Beşiktaş Kurumsal Bayi #07 → 39.400 ₺ teklif verdi!');
  const [timerSeconds, setTimerSeconds] = useState(2890); // ~48 dk

  // Model değiştiğinde baz fiyata sıfırla
  useEffect(() => {
    setCurrentBid(currentPreset.basePrice);
    setBidsCount(12 + Math.floor(Math.random() * 8));
    setRecentDealerText(`${DEALER_NAMES[0]} → ${fmt(currentPreset.basePrice + 450)} ₺ teklif verdi!`);
  }, [selectedModelKey]);

  // Canlı Açık Artırma Simülasyonu (Rakam ve Bayi Teklifi Anlık Yükselir)
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = (Math.floor(Math.random() * 4) + 1) * 150;
      setCurrentBid((prev) => prev + increment);
      setBidsCount((prev) => prev + 1);

      const randomDealer = DEALER_NAMES[Math.floor(Math.random() * DEALER_NAMES.length)];
      setRecentDealerText(`🔥 ${randomDealer} → +${increment} ₺ artırdı!`);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Geri sayım sayacı
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 3600));
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
    <div className="w-full rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-orange-300 p-6 md:p-10 shadow-2xl shadow-orange-950/10 relative overflow-hidden my-6">
      {/* Arka plan canlı turuncu radyal ışıklar */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Sol taraf: Başlık, Canlı İhale Durumu & Model Seçimi */}
        <div className="lg:col-span-7 text-left space-y-4">
          
          {/* Live Beacon Indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500 text-white text-xs font-black tracking-wider uppercase shadow-md shadow-orange-500/30">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
            </span>
            <span>CANLI BAYİ İHALESİ DEVAM EDİYOR</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            Cihazını İhaleye Çıkar, <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">Bayiler En Yüksek Fiyat İçin Yarışsın!</span>
          </h3>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Cihaz modelini seç, canlı açık artırmada yetkili bayilerin kapalı tekliflerle fiyatı nasıl yükselttiğini anında izle.
          </p>

          {/* Model Seçim Çipleri */}
          <div className="pt-2 flex flex-wrap gap-2">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModelKey(modelKey)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedModelKey === modelKey
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-105'
                    : 'bg-orange-50/50 text-slate-700 border-orange-200/80 hover:bg-orange-100 hover:text-orange-900'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: GERÇEKÇİ CANLI AÇIK ARTIRMA SKOR TABLOSU */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 p-6 text-white text-center space-y-4 shadow-2xl shadow-orange-600/30 relative overflow-hidden border border-orange-400">
            
            <div className="flex items-center justify-between gap-2 border-b border-white/20 pb-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-white">
                <Trophy size={16} className="text-amber-200" />
                <span>CANLI EN YÜKSEK TEKLİF</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-orange-100 bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-xs">
                <Clock size={12} />
                <span>Kalan: {formatTime(timerSeconds)}</span>
              </div>
            </div>

            {/* Dinamik Tırmanan Fiyat Sayacı */}
            <div className="py-2 space-y-1">
              <div className="text-xs font-extrabold text-orange-100 uppercase tracking-wider">
                {currentPreset.modelName}
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md animate-pulse">
                {fmt(currentBid)} <span className="text-2xl text-amber-200">₺</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-100 bg-black/20 px-3 py-1 rounded-full">
                <TrendingUp size={14} className="text-amber-300" />
                <span>{bidsCount} Yetkili Bayi Teklif Verdi</span>
              </div>
            </div>

            {/* Anlık Bayi Hareket Akış Bandı */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-3 text-xs font-bold text-white border border-white/20 animate-fade-in">
              <div className="truncate text-amber-100">
                {recentDealerText}
              </div>
            </div>

            <Link
              href={`/sell?model=${encodeURIComponent(selectedModelKey)}`}
              className="w-full py-4 rounded-2xl bg-white hover:bg-orange-50 text-orange-600 font-black text-sm transition-all shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
            >
              <Zap size={16} className="fill-orange-600 text-orange-600" />
              <span>Cihazımı Bu Fiyata İhaleye Çıkar</span>
              <ArrowRight size={16} strokeWidth={3} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
