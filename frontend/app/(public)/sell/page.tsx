'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Smartphone,
  Package, FileText, Zap, Battery, Camera, ChevronRight,
  Clock, Loader2, Star, AlertCircle, Shield, TrendingUp,
  UserCheck, Lock, UserPlus, LogIn, MoreHorizontal
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useCreateSellRequest, useMySellRequest } from '@/lib/hooks/useSellRequests';
import apiClient from '@/lib/api';

// ── 18 Marka Tanımı ve Özel Kullanıcı Logo URL'leri ────────────────────────────────
const BRANDS = [
  { id: 'Apple',          label: 'Apple',          logoUrl: 'https://cdn-icons-png.magnific.com/512/0/747.png' },
  { id: 'Samsung',        label: 'Samsung',        logoUrl: 'https://static.vecteezy.com/system/resources/previews/020/975/545/non_2x/samsung-logo-samsung-icon-transparent-free-png.png' },
  { id: 'Xiaomi',         label: 'Xiaomi',         logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Xiaomi_logo_%282021-%29.svg/960px-Xiaomi_logo_%282021-%29.svg.png' },
  { id: 'Huawei',         label: 'Huawei',         logoUrl: 'https://www.freepnglogos.com/uploads/huawei-logo-png/huawei-logo-transparent-2.png' },
  { id: 'Oppo',           label: 'Oppo',           logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/13/OPPO_Logo_wiki.png' },
  { id: 'realme',         label: 'realme',         logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Realme_logo.png' },
  { id: 'Poco',           label: 'Poco',           logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Poco_Smartphone_Company_logo.png' },
  { id: 'vivo',           label: 'vivo',           logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqWmUV8HRwaOavdOGa_r_4EkvKnT3tAkMMvw&s' },
  { id: 'Honor',          label: 'Honor',          logoUrl: 'https://www.logo.wine/a/logo/Honor_8x/Honor_8x-Logo.wine.svg' },
  { id: 'Infinix',        label: 'Infinix',        logoUrl: 'https://static.vecteezy.com/system/resources/previews/068/973/775/non_2x/infinix-black-wordmark-logo-on-transparent-background-free-png.png' },
  { id: 'Reeder',         label: 'Reeder',         logoUrl: 'https://iconlogovector.com/uploads/images/2024/12/lg-675e2298a5d23-Reeder.webp' },
  { id: 'General Mobile', label: 'General Mobile', logoUrl: 'https://www.dijifabrik.com/wp-content/uploads/2019/04/Group-1026@2x.png' },
  { id: 'Casper',         label: 'Casper',         logoUrl: 'https://www.casper.com.tr/uploads/2021/01/casper-logo-lacivert.png' },
  { id: 'TCL',            label: 'TCL',            logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Logo_of_the_TCL_Corporation.svg/1280px-Logo_of_the_TCL_Corporation.svg.png' },
  { id: 'Nothing',        label: 'Nothing',        logoUrl: 'https://cdn.nothing.community/2025-12-14/1765733320-179713-nothing-01.jpg' },
  { id: 'Omix',           label: 'Omix',           logoUrl: 'https://images.seeklogo.com/logo-png/52/1/omix-telefon-logo-png_seeklogo-522593.png' },
  { id: 'Diğer',          label: 'DİĞER',          logoUrl: '' },
];

function BrandLogo({ id, logoUrl }: { id: string; logoUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  // Koyu yazılı/saydam PNG'si siyah zeminde kaybolan markalar için temiz beyaz rozet
  const whiteBgBrands = ['Samsung', 'Reeder', 'General Mobile', 'Casper', 'Nothing', 'Omix', 'Infinix', 'Honor'];

  if (logoUrl && !imgError) {
    return (
      <div className="w-full h-12 flex items-center justify-center shrink-0 px-1">
        <div className={`h-10 px-3 py-1 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${
          whiteBgBrands.includes(id) ? 'bg-white shadow-md border border-slate-200' : ''
        }`}>
          <img
            src={logoUrl}
            alt={id}
            className="max-h-8 max-w-[100px] object-contain"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  // Özel SVG / Rozet Fallback (Mükemmel Netlik)
  switch (id) {
    case 'Apple':
      return (
        <div className="w-full h-12 flex items-center justify-center text-white">
          <svg viewBox="0 0 170 170" width="36" height="36" fill="currentColor">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-5.04.12-9.84-1.92-14.42-6.12-3.24-2.76-7.14-7.46-11.71-14.1-6.73-9.75-12.01-20.73-15.83-32.93-3.82-12.21-5.73-24.16-5.73-35.86 0-14.85 3.65-27.18 10.96-36.98 7.31-9.8 16.76-14.77 28.34-14.9 5.04 0 10.45 1.25 16.24 3.74 5.79 2.49 9.87 3.74 12.24 3.74 1.94 0 6.13-1.32 12.57-3.97 6.44-2.65 11.83-3.85 16.16-3.61 12.08.74 21.68 5.4 28.8 13.98-10.82 6.53-16.1 15.67-15.84 27.42.25 9.28 3.82 17.06 10.72 23.33 6.9 6.27 15.11 9.77 24.63 10.5-2.58 7.74-5.96 15.54-10.15 23.4zM119.22 31.54c0-7.38 2.65-14.42 7.95-21.13 5.3-6.71 11.94-10.41 19.92-11.1 0 .74.06 1.48.06 2.22 0 7.26-2.71 14.36-8.13 21.3-5.42 6.94-12.07 10.64-19.95 11.1-.06-.74-.11-1.48-.11-2.22z"/>
          </svg>
        </div>
      );
    case 'Samsung':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-[#1428a0] px-3.5 py-1.5 rounded-xl font-black tracking-[0.2em] text-xs shadow-md border border-slate-200">
            SAMSUNG
          </div>
        </div>
      );
    case 'Xiaomi':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="w-10 h-10 bg-[#ff6900] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-orange-500/20">
            mi
          </div>
        </div>
      );
    case 'Huawei':
      return (
        <div className="w-full h-12 flex items-center justify-center gap-1.5 text-white">
          <div className="w-8 h-8 rounded-full bg-[#c7000b] flex items-center justify-center shadow-md">
            <span className="text-white font-black text-xs">H</span>
          </div>
        </div>
      );
    case 'Oppo':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#00875a] text-white px-3.5 py-1.5 rounded-lg font-black tracking-widest text-xs shadow-md">
            oppo
          </div>
        </div>
      );
    case 'realme':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#ffc900] text-black px-3.5 py-1.5 rounded-lg font-black tracking-tight text-xs shadow-md">
            realme
          </div>
        </div>
      );
    case 'Poco':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#ffe800] text-black px-4 py-1.5 rounded-lg font-black tracking-widest text-xs shadow-md">
            POCO
          </div>
        </div>
      );
    case 'vivo':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#0066ff] text-white px-4 py-1.5 rounded-lg font-black tracking-widest text-xs shadow-md">
            vivo
          </div>
        </div>
      );
    case 'Honor':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-slate-900 px-3.5 py-1.5 rounded-xl font-black tracking-widest text-xs shadow-md border border-slate-200">
            HONOR
          </div>
        </div>
      );
    case 'Tecno':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#0052cc] text-white px-3.5 py-1.5 rounded-lg font-black tracking-wider text-xs shadow-md">
            TECNO
          </div>
        </div>
      );
    case 'Infinix':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-emerald-600 px-3.5 py-1.5 rounded-xl font-black tracking-wider text-xs shadow-md border border-slate-200">
            Infinix
          </div>
        </div>
      );
    case 'Reeder':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-slate-900 px-3.5 py-1.5 rounded-xl font-black tracking-wider text-xs shadow-md border border-slate-200">
            reeder
          </div>
        </div>
      );
    case 'General Mobile':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-red-600 px-3.5 py-1.5 rounded-xl font-black tracking-widest text-xs shadow-md border border-slate-200">
            GM
          </div>
        </div>
      );
    case 'Casper':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-[#002C6C] px-3.5 py-1.5 rounded-xl font-black tracking-wider text-xs shadow-md border border-slate-200">
            Casper
          </div>
        </div>
      );
    case 'TCL':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-[#e2001a] text-white px-4 py-1.5 rounded-lg font-black tracking-widest text-xs shadow-md">
            TCL
          </div>
        </div>
      );
    case 'Nothing':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-black px-3.5 py-1.5 rounded-xl font-mono font-bold tracking-widest text-xs shadow-md border border-slate-200">
            NOTHING
          </div>
        </div>
      );
    case 'Omix':
      return (
        <div className="w-full h-12 flex items-center justify-center">
          <div className="bg-white text-black px-3.5 py-1.5 rounded-xl font-black tracking-widest text-xs shadow-md border border-slate-200">
            OMIX
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-12 flex items-center justify-center text-slate-400">
          <MoreHorizontal size={28} />
        </div>
      );
  }
}

const POPULAR_MODELS: Record<string, string[]> = {
  Apple: [
    'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17',
    'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16',
    'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
    'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
    'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 Mini',
    'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 Mini',
    'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
    'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
    'iPhone SE (3. Nesil)', 'iPhone SE (2. Nesil)',
    'iPhone 8 Plus', 'iPhone 8', 'iPhone 7 Plus', 'iPhone 7',
    'Diğer Apple Modeli'
  ],
  Samsung: [
    'Galaxy Z Fold6', 'Galaxy Z Flip6', 'Galaxy Z Fold5', 'Galaxy Z Flip5', 'Galaxy Z Fold4', 'Galaxy Z Flip4',
    'Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24',
    'Galaxy S23 Ultra', 'Galaxy S23+', 'Galaxy S23', 'Galaxy S23 FE',
    'Galaxy S22 Ultra', 'Galaxy S22+', 'Galaxy S22',
    'Galaxy S21 Ultra', 'Galaxy S21+', 'Galaxy S21', 'Galaxy S21 FE',
    'Galaxy S20 Ultra', 'Galaxy S20 FE',
    'Galaxy A55 5G', 'Galaxy A54 5G', 'Galaxy A53 5G', 'Galaxy A52s 5G', 'Galaxy A52',
    'Galaxy A35 5G', 'Galaxy A34 5G', 'Galaxy A33 5G', 'Galaxy A32',
    'Galaxy A25 5G', 'Galaxy A24', 'Galaxy A23', 'Galaxy A15',
    'Galaxy M54', 'Galaxy M53', 'Galaxy M34', 'Galaxy M14',
    'Diğer Samsung Modeli'
  ],
  Xiaomi: [
    'Xiaomi 14 Ultra', 'Xiaomi 14 Pro', 'Xiaomi 14',
    'Xiaomi 13 Ultra', 'Xiaomi 13 Pro', 'Xiaomi 13', 'Xiaomi 13T Pro', 'Xiaomi 13T',
    'Xiaomi 12T Pro', 'Xiaomi 12T', 'Xiaomi 12 Pro', 'Xiaomi 12',
    'Xiaomi 11T Pro', 'Xiaomi 11T', 'Mi 11 Lite',
    'Redmi Note 13 Pro+', 'Redmi Note 13 Pro', 'Redmi Note 13',
    'Redmi Note 12 Pro+', 'Redmi Note 12 Pro', 'Redmi Note 12',
    'Redmi Note 11 Pro+', 'Redmi Note 11 Pro', 'Redmi Note 11',
    'Redmi Note 10 Pro', 'Redmi Note 10S', 'Redmi Note 9 Pro',
    'Diğer Xiaomi Modeli'
  ],
  Huawei: [
    'Pura 70 Ultra', 'Pura 70 Pro', 'Pura 70',
    'Mate 60 Pro+', 'Mate 60 Pro', 'Mate 60',
    'P60 Pro', 'P60', 'Mate 50 Pro',
    'P50 Pro', 'P50 Pocket',
    'P40 Pro', 'P40 Lite', 'P30 Pro', 'P30 Lite',
    'Nova 12 SE', 'Nova 11', 'Nova 10', 'Nova 9',
    'Diğer Huawei Modeli'
  ],
  Oppo: [
    'Find X7 Ultra', 'Find X7',
    'Reno 11 Pro', 'Reno 11', 'Reno 10 Pro+', 'Reno 10 Pro', 'Reno 10',
    'Reno 7', 'Reno 6', 'Reno 5',
    'A79 5G', 'A78', 'A58', 'A54', 'A16',
    'Diğer Oppo Modeli'
  ],
  realme: [
    'GT5 Pro', 'GT3', 'GT Neo 3',
    '12 Pro+', '12 Pro', '12',
    '11 Pro+', '11 Pro', '11',
    '10 Pro+', '10',
    'C67', 'C55', 'C53', 'C21Y',
    'Diğer Realme Modeli'
  ],
  Poco: [
    'POCO F6 Pro', 'POCO F6', 'POCO F5 Pro', 'POCO F5',
    'POCO X6 Pro', 'POCO X6', 'POCO X5 Pro', 'POCO X5',
    'POCO M6 Pro', 'POCO M5s',
    'POCO X3 Pro', 'POCO X3 NFC',
    'Diğer Poco Modeli'
  ],
  vivo: [
    'X100 Pro', 'X100',
    'V30 Pro', 'V30', 'V30 Lite',
    'V29 5G', 'V29 Lite', 'V25 5G',
    'Y36', 'Y35', 'Y22s',
    'Diğer Vivo Modeli'
  ],
  Honor: [
    'Magic6 Pro', 'Magic V2', 'Magic5 Pro',
    'Honor 200 Pro', 'Honor 200', 'Honor 90', 'Honor 70',
    'Honor X9b', 'Honor X9a', 'Honor X7b',
    'Diğer Honor Modeli'
  ],
  Tecno: [
    'Phantom V Fold', 'Phantom V Flip',
    'Camon 30 Pro 5G', 'Camon 30', 'Camon 20 Pro',
    'Spark 20 Pro+', 'Spark 20 Pro', 'Spark 10 Pro',
    'Pova 6 Pro 5G', 'Pova 5 Pro',
    'Diğer Tecno Modeli'
  ],
  Infinix: [
    'Note 40 Pro+ 5G', 'Note 40 Pro', 'Note 40',
    'Note 30 VIP', 'Note 30 Pro', 'Note 30',
    'Zero 30 5G', 'Zero 30',
    'Hot 40 Pro', 'Hot 40i',
    'Diğer Infinix Modeli'
  ],
  'General Mobile': [
    'GM 24 Pro', 'GM 24',
    'GM 23 SE', 'GM 23',
    'GM 22 Pro', 'GM 22 Plus', 'GM 22',
    'GM 21 Pro', 'GM 21 Plus',
    'Diğer GM Modeli'
  ],
  Reeder: [
    'S23 Pro Max', 'S19 Max Pro S', 'S19 Max Pro', 'S19 Max',
    'P13 Blue Max', 'P13 Blue',
    'Diğer Reeder Modeli'
  ],
  Casper: [
    'VIA X30 Plus', 'VIA X30', 'VIA V30', 'VIA M35', 'VIA E30', 'VIA X20',
    'Diğer Casper Modeli'
  ],
  TCL: [
    '40 NXTPAPER', '40 SE', '30+', '30 SE', '20 Pro 5G',
    'Diğer TCL Modeli'
  ],
  Nothing: [
    'Phone (2)', 'Phone (2a) Plus', 'Phone (2a)', 'Phone (1)', 'CMF Phone 1',
    'Diğer Nothing Modeli'
  ],
  Omix: [
    'X600', 'X400', 'X300',
    'Diğer Omix Modeli'
  ],
  Diğer: [
    'Diğer Modeli'
  ]
};

const GRADES = [
  { id: 'A+', label: 'Tertemiz',   desc: 'Sıfır gibi, çizik yok',              color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)' },
  { id: 'A',  label: 'Çok İyi',    desc: 'Mikro çizikler, tamamen işlevsel',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.25)' },
  { id: 'B',  label: 'İyi',        desc: 'Görünür hafif çizikler, normal kullanım', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  { id: 'C',  label: 'Kabul Edilebilir', desc: 'Belirgin hasar, tamamen çalışıyor',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
];

const STEPS = [
  { num: 1, label: 'Marka' },
  { num: 2, label: 'Model' },
  { num: 3, label: 'Durum' },
  { num: 4, label: 'Onay' },
];

// ── Başarı + Canlı Teklif Ekranı ─────────────────────────────────────────────

function SellSuccessScreen({ created, brand, model, router }: { created: any; brand: string; model: string; router: any }) {
  const { data: liveReq } = useMySellRequest(created.id);
  const [ms, setMs] = useState(() => Math.max(0, new Date(created.expiresAt).getTime() - Date.now()));
  const [prevBidCount, setPrevBidCount] = useState(0);
  const [newBidFlash, setNewBidFlash] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setMs(Math.max(0, new Date(created.expiresAt).getTime() - Date.now())), 1000);
    return () => clearInterval(t);
  }, [created.expiresAt]);

  const bidCount = liveReq?.bidCount ?? 0;
  useEffect(() => {
    if (bidCount > prevBidCount && prevBidCount >= 0) {
      setNewBidFlash(true);
      setTimeout(() => setNewBidFlash(false), 2000);
    }
    setPrevBidCount(bidCount);
  }, [bidCount]);

  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const timeStr = ms > 0
    ? (h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    : 'Süre doldu';
  const isExpired = ms === 0;
  const adminApproved = liveReq?.adminApproved ?? false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--k-hot-wash)] to-[var(--k-surface)] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        <div className="bg-[var(--k-surface)] rounded-3xl border border-[var(--k-line)] p-10 shadow-xl shadow-black/5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--k-hot)] to-[var(--k-hot-deep)] flex items-center justify-center mx-auto mb-5 shadow-xl shadow-[var(--k-hot-glow)]/30">
            <Check size={38} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--k-ink)] mb-2">Talebiniz Alındı!</h2>
          <p className="text-[var(--k-ink-3)] text-sm mb-6">
            <strong className="text-[var(--k-ink-2)]">{brand} {model}</strong> için satış talebiniz oluşturuldu.
          </p>

          <div className={`rounded-2xl p-5 mb-5 text-left bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)]`}>
            <div className="flex items-center gap-3 mb-2">
              {adminApproved
                ? <><TrendingUp size={18} className="text-[var(--k-hot)]" /><span className="font-bold text-[var(--k-hot)] text-sm">Onaylandı — Bayiler Teklif Verebilir</span></>
                : <><Shield size={18} className="text-[var(--k-hot)]" /><span className="font-bold text-[var(--k-hot)] text-sm">Admin Onayı Bekleniyor</span></>
              }
            </div>
            <p className="text-sm leading-relaxed text-[var(--k-hot)]">
              {adminApproved
                ? 'Talebiniz onaylandı. Tüm aktif bayilere bildirim gönderildi, teklifler geliyor!'
                : 'Görselleriniz kısa sürede incelenecek. Onaylandıktan sonra bayiler teklif verebilecek.'
              }
            </p>
          </div>

          {adminApproved && (
            <div className="bg-[var(--k-surface-2)] rounded-2xl p-4 mb-5">
              <p className="text-xs uppercase tracking-wider font-bold text-[var(--k-ink-4)] mb-1">
                {isExpired ? 'Teklif süresi doldu' : 'Kalan Teklif Süresi'}
              </p>
              <p className={`font-mono text-3xl font-black ${isExpired ? 'text-indigo-500' : 'text-[var(--k-ink)]'}`}>
                {timeStr}
              </p>
            </div>
          )}

          <div
            className="rounded-2xl p-4 mb-6 transition-all duration-300"
            style={{
              background: newBidFlash ? 'rgba(249,115,22,0.08)' : 'rgba(248,250,252,1)',
              border: newBidFlash ? '1px solid rgba(249,115,22,0.3)' : '1px solid #f1f5f9',
            }}
          >
            <p className="text-xs uppercase tracking-wider font-bold text-[var(--k-ink-4)] mb-1">Gelen Teklifler</p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-black text-4xl text-[var(--k-ink)]">{bidCount}</p>
              {newBidFlash && <span className="text-[var(--k-hot)] font-bold text-sm animate-bounce">+Yeni!</span>}
            </div>
            <p className="text-[var(--k-ink-4)] text-xs mt-1">bayi teklif verdi (anonim)</p>
          </div>

          <div className="bg-[var(--k-surface-2)] rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--k-ink-3)]">Talep Kodu</span>
              <span className="font-mono font-bold text-[var(--k-ink)]">#{created.id.slice(0,8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--k-ink-3)]">Cihaz</span>
              <span className="font-semibold text-[var(--k-ink)]">{brand} {model}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/hesabim?tab=sell-requests')}
              className="w-full py-3.5 bg-[var(--k-canvas)] text-white rounded-xl font-bold hover:bg-[var(--k-void)] transition-colors"
            >
              Teklifleri Takip Et
            </button>
            <Link href="/" className="w-full py-3.5 border border-[var(--k-line)] text-[var(--k-ink-2)] rounded-xl font-semibold text-center hover:bg-[var(--k-surface-2)] transition-colors block">
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SellPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isTradeIn    = searchParams.get('type') === 'trade-in';
  const autoSubmit   = searchParams.get('autoSubmit') === 'true';
  const { user }     = useApp();
  const createRequest = useCreateSellRequest();

  const [step, setStep]         = useState(0);
  const [done, setDone]         = useState(false);
  const [created, setCreated]   = useState<any>(null);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

  // Form state
  const [brand,          setBrand]          = useState('');
  const [model,          setModel]          = useState('');
  const [storage,        setStorage]        = useState('');
  const [color,          setColor]          = useState('');
  const [grade,          setGrade]          = useState('');
  const [battery,        setBattery]        = useState<number | ''>('');
  const [warrantyStatus, setWarrantyStatus] = useState('Garantisi Yok');
  const [hasBox,         setHasBox]         = useState(false);
  const [hasInvoice,     setHasInvoice]     = useState(false);
  const [desc,           setDesc]           = useState('');
  const [images,         setImages]         = useState<string[]>([]);
  const [uploading,      setUploading]      = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // ── Session Storage Draft Restoring ──────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mytt_sell_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brand) setBrand(parsed.brand);
        if (parsed.model) setModel(parsed.model);
        if (parsed.storage) setStorage(parsed.storage);
        if (parsed.color) setColor(parsed.color);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.battery !== undefined) setBattery(parsed.battery);
        if (parsed.warrantyStatus) setWarrantyStatus(parsed.warrantyStatus);
        if (parsed.hasBox !== undefined) setHasBox(parsed.hasBox);
        if (parsed.hasInvoice !== undefined) setHasInvoice(parsed.hasInvoice);
        if (parsed.desc) setDesc(parsed.desc);
        if (Array.isArray(parsed.images)) setImages(parsed.images);
        if (parsed.step !== undefined) setStep(parsed.step);
      }
    } catch {}
  }, []);

  // Save to Session Storage on change
  useEffect(() => {
    try {
      if (brand || model || grade || images.length > 0) {
        sessionStorage.setItem('mytt_sell_draft', JSON.stringify({
          brand, model, storage, color, grade, battery, warrantyStatus,
          hasBox, hasInvoice, desc, images, step
        }));
      }
    } catch {}
  }, [brand, model, storage, color, grade, battery, warrantyStatus, hasBox, hasInvoice, desc, images, step]);

  // ── Form gönder (EN AZ 3, EN FAZLA 5 GÖRSEL KONTROLÜ İLE) ────────────────────
  const handleSubmit = async () => {
    if (images.length < 3) {
      alert('İhaleyi başlatabilmek için en az 3 adet cihaz fotoğrafı yüklemelisiniz.');
      return;
    }
    if (!user) {
      setShowAuthGateModal(true);
      return;
    }
    try {
      const result = await createRequest.mutateAsync({
        brand,
        model,
        storage:       storage || undefined,
        color:         color   || undefined,
        grade,
        batteryHealth: battery !== '' ? Number(battery) : undefined,
        hasBox,
        hasInvoice,
        hasAccessories: false,
        description:   desc ? `[Garanti: ${warrantyStatus}] ${desc}` : `[Garanti: ${warrantyStatus}]`,
        imagesUrl:     images,
        requestType:   isTradeIn ? 'TRADE_IN' : 'SELL',
      });
      sessionStorage.removeItem('mytt_sell_draft');
      setCreated(result);
      setDone(true);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  // Auto-submit after returning logged in
  useEffect(() => {
    if (user && (autoSubmit || showAuthGateModal) && brand && model && grade && images.length >= 3) {
      setShowAuthGateModal(false);
      handleSubmit();
    }
  }, [user, autoSubmit]);

  // ── Görsel yükleme (EN AZ 3, EN FAZLA 5 FOTOĞRAF KURALI) ───────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 5) {
      alert('En fazla 5 adet fotoğraf yükleyebilirsiniz.');
      return;
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append('file', file);
        const { data } = await apiClient.post('/uploads/image', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        urls.push(data.url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      alert('Fotoğraf yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [images]);

  // ── Step validation ──────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return !!brand;
    if (step === 1) return !!model;
    if (step === 2) return !!grade;
    if (step === 3) return images.length >= 3 && images.length <= 5;
    return true;
  };

  // ── Başarı ekranı ────────────────────────────────────────────────────────
  if (done && created) {
    return <SellSuccessScreen created={created} brand={brand} model={model} router={router} />;
  }

  // ── Ana form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--k-canvas)] pt-20 pb-20 relative">
      
      {/* AUTH PROMPT MODAL */}
      {showAuthGateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[var(--k-surface)] border border-[var(--k-line-hot)] rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setShowAuthGateModal(false)}
                className="text-[var(--k-ink-4)] hover:text-white p-2 rounded-full hover:bg-[var(--k-surface-2)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--k-hot)] to-[var(--k-hot-deep)] flex items-center justify-center mx-auto shadow-xl shadow-[var(--k-hot-glow)]/30">
              <Zap size={32} className="text-white fill-white animate-pulse" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                <Check size={14} />
                <span>CİHAZ BİLGİLERİNİZ HAZIR & KAYDEDİLDİ</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Son Adım: İhalenizi Başlatmak İçin Giriş Yapın
              </h3>

              <div className="bg-[var(--k-void)] p-3 rounded-xl border border-[var(--k-line-2)] inline-block w-full">
                <p className="text-xs font-bold text-[var(--k-hot)]">
                  📱 {brand} {model} ({GRADES.find(g => g.id === grade)?.label || grade})
                </p>
              </div>

              <p className="text-xs text-[var(--k-ink-3)] font-medium leading-relaxed pt-1">
                İhalenizi 150+ onaylı yetkili bayiye anında başlatıp canlı teklifleri izlemek için hemen giriş yapın veya 10 saniyede ücretsiz hesap oluşturun.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent('/sell?autoSubmit=true')}`}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] text-white font-black text-sm transition-all shadow-xl shadow-[var(--k-hot-glow)] flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                <span>Giriş Yap ve İhaleyi Başlat</span>
              </Link>

              <Link
                href={`/register?redirect=${encodeURIComponent('/sell?autoSubmit=true')}`}
                className="w-full py-3.5 rounded-2xl bg-[var(--k-surface-2)] hover:bg-[var(--k-surface-3)] border border-[var(--k-line-2)] text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={18} className="text-[var(--k-hot)]" />
                <span>Ücretsiz Hesap Oluştur</span>
              </Link>
            </div>

            <p className="text-[10px] text-[var(--k-ink-4)]">
              *Tüm bilgileriniz gizlidir. Hiçbir bilgi kaybolmaz, hesabınız açılır açılmaz ihaleniz canlıya alınır.
            </p>

          </div>
        </div>
      )}

      {/* Header Container */}
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors text-sm">
            <ArrowLeft size={16} />
            Ana Sayfa
          </Link>
        </div>

        {/* NUMARALI KURUMSAL STEPPER BAR (GÖRSELDEKİ BİREBİR YAPI: 1 - 2 - 3 - 4) */}
        <div className="max-w-2xl mx-auto my-6 sm:my-10 relative">
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-slate-800 -translate-y-1/2 -z-0" />
          <div className="flex items-center justify-between relative z-10">
            {STEPS.map((s, i) => {
              const active = i === step;
              const past   = i < step;
              return (
                <button
                  key={s.num}
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex flex-col items-center gap-2 group ${i > step ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all duration-300 ${
                    past   ? 'bg-[var(--k-hot)] text-white shadow-md' :
                    active ? 'bg-[var(--k-hot)] text-white ring-4 ring-[var(--k-hot-wash)] scale-110 shadow-xl shadow-[var(--k-hot-glow)]/40 border-2 border-white' :
                             'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}>
                    {past ? <Check size={18} strokeWidth={3} /> : s.num}
                  </div>
                  <span className={`text-xs font-bold ${active ? 'text-[var(--k-hot)]' : past ? 'text-slate-300' : 'text-slate-500'}`}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── STEP 0: MARKANIZI SEÇİN ──────────────── */}
        {step === 0 && (
          <div className="space-y-8 text-center max-w-5xl mx-auto">
            
            <h2 className="text-xl sm:text-3xl font-black text-slate-300 uppercase tracking-widest font-mono">
              MARKANIZI SEÇİN
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBrand(b.id); setModel(''); setStep(1); }}
                  className={`p-4 sm:p-5 rounded-2xl border text-center transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center gap-3 group relative overflow-hidden ${
                    brand === b.id
                      ? 'border-[var(--k-hot)] bg-[var(--k-surface)] ring-2 ring-[var(--k-hot)]/40 shadow-xl shadow-[var(--k-hot-glow)]/20'
                      : 'border-slate-800 bg-[var(--k-surface)] hover:border-slate-600 hover:bg-[var(--k-surface-2)]'
                  }`}
                >
                  <BrandLogo id={b.id} logoUrl={b.logoUrl} />

                  <span className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight group-hover:text-white">
                    {b.label}
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* ── STEP 1: Model Seçimi & Detaylar ────────────────── */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Model & Cihaz Bilgileri</h2>
              <span className="text-xs font-black text-[var(--k-hot)] bg-[var(--k-hot-wash)] px-3.5 py-1 rounded-full border border-[var(--k-line-hot)]">
                {brand}
              </span>
            </div>

            {/* Popüler Modeller Izgarası */}
            {(POPULAR_MODELS[brand] ?? []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {(POPULAR_MODELS[brand] ?? []).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    className={`p-3.5 rounded-xl border text-left transition-all font-semibold text-xs flex items-center justify-between ${
                      model === m
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)] text-[var(--k-hot)] font-bold shadow-md'
                        : 'border-slate-800 bg-[var(--k-surface)] text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span className="truncate">{m}</span>
                    {model === m && <Check size={15} className="text-[var(--k-hot)] shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            {/* Depolama & Renk & Batarya Sağlığı */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Depolama</label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-slate-700 text-white text-sm font-medium focus:outline-none focus:border-[var(--k-hot)]"
                >
                  <option value="">Seçiniz</option>
                  {['64 GB', '128 GB', '256 GB', '512 GB', '1 TB', '2 TB'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Renk</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Örn: Siyah / Titanyum"
                  className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-slate-700 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-[var(--k-hot)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Batarya Sağlığı (%)
                </label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={battery}
                  onChange={(e) => setBattery(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Örn: 88 (Biliniyorsa)"
                  className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-slate-700 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-[var(--k-hot)]"
                />
              </div>
            </div>

            {/* Garanti Durumu */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Garanti Durumu
              </label>
              <select
                value={warrantyStatus}
                onChange={(e) => setWarrantyStatus(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-slate-700 text-white text-sm font-medium focus:outline-none focus:border-[var(--k-hot)]"
              >
                <option value="Resmi Distribütör Garantili (Devam Ediyor)">Resmi Distribütör Garantili (Devam Ediyor)</option>
                <option value="İthalatçı Garantili (Devam Ediyor)">İthalatçı Garantili (Devam Ediyor)</option>
                <option value="Garantisi Bitti / Yok">Garantisi Bitti / Yok</option>
              </select>
            </div>

            {/* Kutu & Fatura Seçimi (AKSESUAR SEÇİMİ KALDIRILDI) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kutu / Fatura Durumu</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Kutu Var', state: hasBox, setState: setHasBox },
                  { label: 'Fatura Var', state: hasInvoice, setState: setHasInvoice },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.setState(!item.state)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      item.state
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)] text-[var(--k-hot)]'
                        : 'border-slate-800 bg-[var(--k-surface)] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {item.state && <Check size={14} />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Detay Açıklama Kutusu */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Cihaz Detayları & Açıklama (Opsiyonel)
              </label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Cihaz kaç aylık, garantisi kaç ay kaldı, kozmetik durumu nasıl, ekranda/kasede çizik varmı, tamir gördü mü vb. detayları yazabilirsiniz..."
                className="w-full p-4 rounded-xl bg-[var(--k-surface)] border border-slate-700 text-white text-sm font-medium placeholder-slate-500 focus:outline-none focus:border-[var(--k-hot)] resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 2: Durum (Kozmetik Seçimi) ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-xl font-bold text-white">Kozmetik Durum Seçimi</h2>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kozmetik Derece</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGrade(g.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      grade === g.id
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)]'
                        : 'border-slate-800 bg-[var(--k-surface)] hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-white">{g.label} ({g.id})</span>
                      {grade === g.id && <Check size={16} className="text-[var(--k-hot)]" />}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Hızlı Özet Gösterimi */}
            <div className="bg-[var(--k-surface)] rounded-2xl border border-slate-800 p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Model</span>
                <span className="font-bold text-white">{brand} {model}</span>
              </div>
              {storage && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Depolama / Renk</span>
                  <span className="font-bold text-white">{storage} {color ? `/ ${color}` : ''}</span>
                </div>
              )}
              {battery !== '' && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Batarya Sağlığı</span>
                  <span className="font-bold text-white">%{battery}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── STEP 3: Onay & Fotoğraf (EN AZ 3, EN FAZLA 5 FOTOĞRAF YÜKLEME) ────────────────── */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Fotoğraf Yükleme Alanı */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Fotoğraf Yükleyin (Zorunlu)</h2>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  images.length >= 3 && images.length <= 5
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                }`}>
                  {images.length >= 3 ? `✓ ${images.length}/5 Fotoğraf Yüklendi` : `En az 3 fotoğraf ekleyin (${images.length}/5)`}
                </span>
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || images.length >= 5}
                className="w-full p-6 border-2 border-dashed border-slate-700 hover:border-[var(--k-hot)] bg-[var(--k-surface)] rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <Loader2 size={28} className="text-slate-400 animate-spin" />
                ) : (
                  <Upload size={28} className="text-[var(--k-hot)]" />
                )}
                <p className="text-slate-200 font-semibold text-sm">
                  {uploading ? 'Yükleniyor...' : 'Cihaz Fotoğraflarını Seç (En az 3, Max 5)'}
                </p>
                <p className="text-slate-400 text-xs">
                  Açık artırmadaki bayilerin doğru teklif verebilmesi için en az 3 adet net fotoğraf zorunludur.
                </p>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2.5">
                  {images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors">
                        <X size={12} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 3 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-400 shrink-0" />
                  <p className="text-amber-300 text-xs font-semibold">
                    İhaleyi başlatabilmek için lütfen cihazın önden, arkadan ve ekran açık durumdaki en az 3 adet fotoğrafını yükleyin.
                  </p>
                </div>
              )}
            </div>

            {/* Özet Tablosu */}
            <div className="bg-[var(--k-surface)] rounded-2xl border border-slate-800 p-5 space-y-3">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">Cihaz Özeti</h3>
              {[
                ['Marka & Model', `${brand} ${model}`],
                ['Depolama', storage || '—'],
                ['Renk', color || '—'],
                ['Pil Sağlığı', battery !== '' ? `%${battery}` : '—'],
                ['Garanti Durumu', warrantyStatus],
                ['Kozmetik Durum', `${grade} — ${GRADES.find(g => g.id === grade)?.label}`],
                ['Kutu / Fatura Durumu', `${hasBox ? 'Kutu Var' : 'Kutu Yok'}, ${hasInvoice ? 'Fatura Var' : 'Fatura Yok'}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-semibold text-white">{v}</span>
                </div>
              ))}
            </div>

            <div className="bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)] rounded-2xl p-4 flex items-center gap-3">
              <Clock size={20} className="text-[var(--k-hot)] shrink-0" />
              <p className="text-[var(--k-hot)] text-xs font-semibold leading-relaxed">
                Talebiniz gönderildiğinde 150+ yetkili bayiye anında bildirim gider. 1 saatlik kapalı canlı artırmada en yüksek teklifi onaylayabilirsiniz.
              </p>
            </div>

          </div>
        )}

        {/* Bottom Navigation */}
        <div className="max-w-2xl mx-auto flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-bold text-sm hover:border-slate-500 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Geri
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3.5 rounded-xl bg-[var(--k-hot)] text-white font-black text-sm hover:bg-[var(--k-hot-deep)] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[var(--k-hot-glow)]/20">
              Devam Et <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createRequest.isPending || images.length < 3 || images.length > 5}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] text-white font-black text-sm hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-[var(--k-hot-glow)]/30">
              {createRequest.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> İhaleye Gönderiliyor...</>
              ) : (
                <><Zap size={18} className="fill-white" /> Cihazımı Ücretsiz İhaleye Çıkar</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
