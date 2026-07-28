'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

const PRESET_MODELS: Record<string, { price: string; grade: string }> = {
  'iPhone 15 Pro Max (256GB)': { price: '52.500 ₺', grade: 'A+ Kusursuz' },
  'iPhone 14 Pro (128GB)': { price: '38.200 ₺', grade: 'A Kusursuz' },
  'iPhone 13 (128GB)': { price: '24.900 ₺', grade: 'A Kusursuz' },
  'Galaxy S24 Ultra (512GB)': { price: '49.800 ₺', grade: 'A+ Kusursuz' },
  'Galaxy S23 (128GB)': { price: '21.500 ₺', grade: 'A Kusursuz' },
};

export default function QuickValuationWidget() {
  const [selectedModel, setSelectedModel] = useState('iPhone 14 Pro (128GB)');
  const current = PRESET_MODELS[selectedModel] || PRESET_MODELS['iPhone 14 Pro (128GB)'];

  return (
    <div className="w-full rounded-3xl bg-white/95 backdrop-blur-xl border border-orange-200/80 p-7 md:p-10 shadow-2xl shadow-orange-950/10 relative overflow-hidden my-6">
      {/* Arka plan yumuşak turuncu ışıklar */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Sol taraf: Başlık & Model Seçim Butonları */}
        <div className="lg:col-span-7 text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/70 border border-orange-200 text-orange-800 text-xs font-extrabold tracking-wider uppercase shadow-xs">
            <Zap size={14} className="fill-orange-600 text-orange-600" />
            <span>ANINDA CİHAZ DEĞERLEME SİHİRBAZI</span>
          </div>

          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
            Cihazını Seç, <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">En Yüksek Bayi Teklifini</span> Anında Gör!
          </h3>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
            Modelini seçerek canlı piyasa değerini hesapla. Formu doldur, yetkili bayiler 1 saat içinde kapalı tekliflerde yarışsın.
          </p>

          {/* Model Seçim Çipleri */}
          <div className="pt-2 flex flex-wrap gap-2">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModel(modelKey)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedModel === modelKey
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white border-orange-500 shadow-md shadow-orange-500/30 scale-105'
                    : 'bg-orange-50/40 text-slate-700 border-orange-200/80 hover:bg-orange-100 hover:text-orange-900'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: Canlı Değerlendirme Fiyat Kartı */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-gradient-to-b from-orange-50/50 via-white to-amber-50/40 border border-orange-200 p-6 text-center space-y-4 shadow-lg">
            <div className="text-xs font-extrabold text-orange-600/80 uppercase tracking-wider">
              {selectedModel} · CANLI PİYASA DEĞERİ
            </div>

            <div className="py-2">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
                {current.price}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs font-extrabold text-orange-700">
                <CheckCircle2 size={15} className="text-orange-600" />
                <span>Ortalama Bayi Açık Artırma Fiyatı</span>
              </div>
            </div>

            <div className="pt-3 border-t border-orange-200/60 flex items-center justify-between gap-3">
              <Link
                href={`/sell?model=${encodeURIComponent(selectedModel)}`}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <span>Bu Fiyata Satış Başlat</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
