'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    <div className="w-full rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 p-6 md:p-8 text-white shadow-2xl relative overflow-hidden my-8">
      {/* Arka plan ışıkları */}
      <div className="pointer-events-none absolute -right-20 -top-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">

        {/* Sol taraf: Başlık & Model Seçici */}
        <div className="lg:col-span-7 text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold tracking-wider uppercase">
            <Zap size={14} className="fill-indigo-400 text-indigo-400 animate-pulse" />
            <span>ANINDA CİHAZ DEĞERLEME SİHİRBAZI</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
            Cihazını Seç, <span className="text-emerald-400">Bayilerin Vereceği En Yüksek Teklifi</span> Anında Gör!
          </h3>

          <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-xl">
            Modelini seçerek canlı piyasa değerini hesapla. Formu doldur, yetkili bayiler 1 saat içinde kapalı tekliflerde yarışsın.
          </p>

          {/* Model Seçim Çipleri */}
          <div className="pt-2 flex flex-wrap gap-2">
            {Object.keys(PRESET_MODELS).map((modelKey) => (
              <button
                key={modelKey}
                onClick={() => setSelectedModel(modelKey)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedModel === modelKey
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {modelKey.split(' ')[0]} {modelKey.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {/* Sağ taraf: Canlı Değerleme Kartı */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-slate-800/90 border border-slate-700 p-6 backdrop-blur-xl text-center space-y-4 shadow-xl">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              {selectedModel} · CANLI PİYASA DEĞERİ
            </div>

            <div className="py-2">
              <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                {current.price}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 text-xs font-extrabold text-emerald-400">
                <CheckCircle2 size={14} />
                <span>Ortalama Bayi Açık Artırma Fiyatı</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between gap-3">
              <Link
                href={`/sell?model=${encodeURIComponent(selectedModel)}`}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
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
