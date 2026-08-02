'use client';
import Link from 'next/link';
import { ShieldAlert, ShieldCheck, Zap, ArrowRight, XCircle, CheckCircle2, Store, Users, DollarSign } from 'lucide-react';

export default function AntiRefurbishedBanner() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 my-6">
      
      {/* ── 1. MÜŞTERİ & TELEFONCU ESNAFI CANLI İHALE BANNER'I ────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#090D16] via-[#131927] to-[#090D16] border border-orange-500/30 p-6 sm:p-10 shadow-2xl mb-6 group">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-[#FF6000]/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FF6000]/15 border border-[#FF6000]/40 text-[#FF6000] text-xs font-black tracking-wider uppercase">
              <Store size={15} />
              <span>DOĞRUDAN MÜŞTERİ VE TELEFONCU ESNAFI TİCARETİ</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
              Fiyatı Otomatik Algoritma Değil, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6000] to-[#FF8C00]">İşini Bilen Telefoncu Esnafı</span> Versin!
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              Arada aracı komisyoncular yok! Cihazını 1 dakika içinde ihaleye çıkar, Türkiye'nin 150+ onaylı yetkili telefoncu bayisi canlı açık artırmada yarışsın. En yüksek teklifi sen seç, paranı %100 Escrow korumasıyla anında al.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6000] via-[#FF6000] to-[#EA580C] hover:from-[#EA580C] hover:to-[#C2410C] text-white font-black text-sm shadow-xl shadow-[#FF6000]/30 transition-all hover:scale-105"
              >
                <Zap size={18} className="fill-white" />
                <span>Cihazını İhaleye Çıkar & Teklif Al</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <Users size={28} className="text-[#FF6000] mx-auto mb-2" />
              <p className="font-black text-2xl text-white">150+</p>
              <p className="text-xs text-slate-400 font-semibold">Onaylı Yetkili Bayi</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-md">
              <DollarSign size={28} className="text-emerald-400 mx-auto mb-2" />
              <p className="font-black text-2xl text-white">%100</p>
              <p className="text-xs text-slate-400 font-semibold">Gerçek Piyasa Değeri</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. YENİLENMİŞ YAN SANAYİ CİHAZ DÜŞMANI SLOGAN BANNER'I ───────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-black tracking-wider uppercase">
              <ShieldAlert size={15} />
              <span>YAN SANAYİ PARÇALI "YENİLENMİŞ" RİSKİNE SON</span>
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white leading-snug">
              Bizde Çakma Parça Yok! Sadece <span className="text-emerald-400">%100 Orijinal Sıfır</span> ve <span className="text-[#FF6000]">Doğrulanmış 2. El</span> Var.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-3xl">
              Piyasada "yenilenmiş" adı altında satılan yan sanayi Çin ekranlı, değişmiş ucuz bataryalı ve sürekli arızalanan telefonlardan bıktınız mı? MYTT'de kurcalanmış yan sanayi cihaz kesinlikle satılmaz.
            </p>
          </div>

          <div className="shrink-0">
            <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm text-center">
              ✓ %100 Orijinal Parça Garantisi
            </div>
          </div>
        </div>

        {/* Karşılaştırma Izgarası */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          
          {/* ❌ Yenilenmiş Cihaz Riski */}
          <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-black text-sm">
              <XCircle size={18} />
              <span>Piyasadaki "Yenilenmiş" Cihazlar (Uzak Durun)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                Yan sanayi kalitesiz Çin ekranı (Dokunmatik donar, renkler soluktur)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                Orijinal olmayan ucuz yan sanayi batarya (Çabuk biter, ısınır)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                Toplama kasa ve içi kurcalanmış anakart tamir riski
              </li>
            </ul>
          </div>

          {/* ✅ MYTT Orijinal Cihaz Standartı */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <ShieldCheck size={18} />
              <span>MYTT Orijinal Sıfır & 2. El Standartı (Güvenli)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                %100 Orijinal ekran, orijinal kasa ve şeffaf ekspertiz raporu
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                Orijinal pil sağlığı ve fabrikasyon parçalar
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                150+ Onaylı telefoncu esnafı kontrolü & 12 ay garanti güvencesi
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
