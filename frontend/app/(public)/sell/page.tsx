'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Smartphone,
  Package, FileText, Zap, Battery, Camera, ChevronRight,
  Clock, Loader2, Star, AlertCircle, Shield, TrendingUp,
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useCreateSellRequest, useMySellRequest } from '@/lib/hooks/useSellRequests';
import apiClient, { API_BASE } from '@/lib/api';

// ── Sabit veriler ─────────────────────────────────────────────────────────────
const BRANDS = [
  { id: 'Apple',   label: 'Apple',   color: '#1d1d1f', abbr: 'A' },
  { id: 'Samsung', label: 'Samsung', color: '#1428a0', abbr: 'S' },
  { id: 'Xiaomi',  label: 'Xiaomi',  color: '#ff6900', abbr: 'X' },
  { id: 'Google',  label: 'Google',  color: '#4285f4', abbr: 'G' },
  { id: 'Huawei',  label: 'Huawei',  color: '#cf0a2c', abbr: 'H' },
  { id: 'OnePlus', label: 'OnePlus', color: '#f5010c', abbr: 'O' },
  { id: 'Diğer',   label: 'Diğer',   color: '#6b7280', abbr: '?' },
];

const POPULAR_MODELS: Record<string, string[]> = {
  Apple:   ['iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15','iPhone 14 Pro Max','iPhone 14 Pro','iPhone 14','iPhone 13 Pro','iPhone 13','iPhone 12','iPhone 11'],
  Samsung: ['Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy S23','Galaxy S22','Galaxy A54','Galaxy A34','Galaxy Z Fold 5','Galaxy Z Flip 5'],
  Xiaomi:  ['Xiaomi 14','Xiaomi 13','Redmi Note 13 Pro','Redmi Note 12 Pro','POCO F5','POCO X5 Pro'],
  Google:  ['Pixel 8 Pro','Pixel 8','Pixel 7 Pro','Pixel 7'],
  Huawei:  ['P60 Pro','Mate 60 Pro','Nova 12'],
  OnePlus: ['12','11','Nord 3','Nord CE 3'],
  Diğer:   [],
};

const GRADES = [
  { id: 'A+', label: 'Tertemiz',   desc: 'Sıfır gibi, çizik yok',              color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)',  border: 'rgba(139,92,246,0.25)' },
  { id: 'A',  label: 'Çok İyi',    desc: 'Mikro çizikler, tamamen işlevsel',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)',  border: 'rgba(14,165,233,0.25)' },
  { id: 'B',  label: 'İyi',        desc: 'Görünür hafif çizikler, normal kullanım', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  { id: 'C',  label: 'Kabul Edilebilir', desc: 'Belirgin hasar, tamamen çalışıyor',   color: '#ef4444', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)' },
];

const STEPS = [
  { label: 'Marka', icon: Smartphone },
  { label: 'Model', icon: Star },
  { label: 'Durum', icon: Zap },
  { label: 'Fotoğraf', icon: Camera },
  { label: 'Onay', icon: Check },
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-3xl border border-slate-200 p-10 shadow-xl shadow-black/5 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-violet-500/30">
            <Check size={38} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Talebiniz Alındı!</h2>
          <p className="text-zinc-500 text-sm mb-6">
            <strong className="text-zinc-700">{brand} {model}</strong> için satış talebiniz oluşturuldu.
          </p>

          {/* Admin Onayı Durumu */}
          <div className={`rounded-2xl p-5 mb-5 text-left ${adminApproved ? 'bg-violet-50 border border-violet-200' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-center gap-3 mb-2">
              {adminApproved
                ? <><TrendingUp size={18} className="text-violet-600" /><span className="font-bold text-violet-800 text-sm">Onaylandı — Bayiler Teklif Verebilir</span></>
                : <><Shield size={18} className="text-amber-600" /><span className="font-bold text-amber-800 text-sm">Admin Onayı Bekleniyor</span></>
              }
            </div>
            <p className={`text-sm leading-relaxed ${adminApproved ? 'text-violet-700' : 'text-amber-700'}`}>
              {adminApproved
                ? 'Talebiniz onaylandı. Tüm aktif bayilere bildirim gönderildi, teklifler geliyor!'
                : 'Görselleriniz kısa sürede incelenecek. Onaylandıktan sonra bayiler teklif verebilecek.'
              }
            </p>
          </div>

          {/* Sayaç */}
          {adminApproved && (
            <div className="bg-slate-50 rounded-2xl p-4 mb-5">
              <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                {isExpired ? 'Teklif süresi doldu' : 'Kalan Teklif Süresi'}
              </p>
              <p className={`font-mono text-3xl font-black ${isExpired ? 'text-indigo-500' : 'text-zinc-900'}`}>
                {timeStr}
              </p>
            </div>
          )}

          {/* Canlı Teklif Sayacı */}
          <div
            className="rounded-2xl p-4 mb-6 transition-all duration-300"
            style={{
              background: newBidFlash ? 'rgba(139,92,246,0.08)' : 'rgba(248,250,252,1)',
              border: newBidFlash ? '1px solid rgba(139,92,246,0.3)' : '1px solid #f1f5f9',
            }}
          >
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">Gelen Teklifler</p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-black text-4xl text-zinc-900">{bidCount}</p>
              {newBidFlash && <span className="text-violet-600 font-bold text-sm animate-bounce">+Yeni!</span>}
            </div>
            <p className="text-slate-400 text-xs mt-1">bayi teklif verdi (anonim)</p>
          </div>

          {/* Detaylar */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Talep Kodu</span>
              <span className="font-mono font-bold text-zinc-900">#{created.id.slice(0,8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Cihaz</span>
              <span className="font-semibold text-zinc-900">{brand} {model}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/hesabim?tab=sell-requests')}
              className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
            >
              Teklifleri Takip Et
            </button>
            <Link href="/" className="w-full py-3.5 border border-slate-200 text-zinc-600 rounded-xl font-semibold text-center hover:bg-slate-50 transition-colors block">
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
  const { user, setShowAuthModal } = useApp();
  const createRequest = useCreateSellRequest();

  const [step, setStep]     = useState(0);
  const [done, setDone]     = useState(false);
  const [created, setCreated] = useState<any>(null);

  // Form state
  const [brand,     setBrand]     = useState('');
  const [model,     setModel]     = useState('');
  const [customModel, setCustomModel] = useState('');
  const [storage,   setStorage]   = useState('');
  const [color,     setColor]     = useState('');
  const [grade,     setGrade]     = useState('');
  const [battery,   setBattery]   = useState<number | ''>('');
  const [hasBox,    setHasBox]    = useState(false);
  const [hasInvoice, setHasInvoice] = useState(false);
  const [hasAcc,    setHasAcc]    = useState(false);
  const [desc,      setDesc]      = useState('');
  const [images,    setImages]    = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const finalModel = model === 'Diğer' ? customModel : model;

  // ── Görsel yükleme ───────────────────────────────────────────────────────
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    if (images.length + files.length > 6) {
      alert('En fazla 6 fotoğraf yükleyebilirsiniz.');
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
        urls.push(data.url);   // Göreceli yol — resolveUploadUrl() domain bağımsız halleder
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      alert('Fotoğraf yüklenirken hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [images]);

  // ── Form gönder ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) { setShowAuthModal(true); return; }
    try {
      const result = await createRequest.mutateAsync({
        brand,
        model:         finalModel,
        storage:       storage || undefined,
        color:         color   || undefined,
        grade,
        batteryHealth: battery !== '' ? Number(battery) : undefined,
        hasBox,
        hasInvoice,
        hasAccessories: hasAcc,
        description:   desc || undefined,
        imagesUrl:     images,
        requestType:   isTradeIn ? 'TRADE_IN' : 'SELL',
      });
      setCreated(result);
      setDone(true);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  // ── Step validation ──────────────────────────────────────────────────────
  const canNext = () => {
    if (step === 0) return !!brand;
    if (step === 1) return !!(model || customModel);
    if (step === 2) return !!grade;
    if (step === 3) return images.length >= 2;
    return true;
  };

  // ── Giriş yapılmamışsa login gate ────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/20">
            <Smartphone size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-3">Cihazını Sat</h1>
          <p className="text-zinc-500 mb-8 leading-relaxed">
            Cihazını platforma sat, 30 dakika içinde yüzlerce bayiden teklifler gelsin.
            Hesabınıza giriş yaparak başlayın.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-[15px] hover:bg-black transition-colors"
          >
            Giriş Yap / Kayıt Ol
          </button>
          <Link href="/" className="block mt-4 text-zinc-400 hover:text-zinc-600 text-sm transition-colors">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  // ── Başarı ekranı ────────────────────────────────────────────────────────
  if (done && created) {
    return <SellSuccessScreen created={created} brand={brand} model={finalModel} router={router} />;
  }

  // ── Ana form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-700 transition-colors mb-8 text-sm">
          <ArrowLeft size={16} />
          Ana Sayfa
        </Link>

        <div className="mb-2">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            {isTradeIn ? 'Cihazını Takasa Ver' : 'Cihazını Sat'}
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            {isTradeIn
              ? 'Cihaz bilgilerini gir, bayilerden takas teklifi al, farkı öde, yeni cihaza geç.'
              : 'Bilgileri gir, 30 dakika içinde bayilerden teklif al.'}
          </p>
        </div>

        {/* Trade-in mode banner */}
        {isTradeIn && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 mb-2 mt-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <ArrowRight size={14} className="text-white" />
            </div>
            <div>
              <p className="text-blue-900 font-bold text-sm">Takas Modu Aktif</p>
              <p className="text-blue-700 text-xs">Bu form ile oluşturduğun talep &quot;Takas&quot; olarak işaretlenecek.</p>
            </div>
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-1 mb-10 mt-6">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1 flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${ i < step ? 'bg-zinc-900 text-white' : i === step ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30' : 'bg-slate-200 text-slate-400' }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 transition-all ${i < step ? 'bg-zinc-900' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <p className="text-xs uppercase tracking-widest font-bold text-violet-600 mb-4">
          Adım {step + 1} / {STEPS.length} — {STEPS[step].label}
        </p>

        {/* ── STEP 0: Marka ────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BRANDS.map((b) => (
              <button
                key={b.id}
                onClick={() => { setBrand(b.id); setModel(''); setCustomModel(''); }}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${ brand === b.id ? 'border-zinc-900 bg-zinc-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-400 text-zinc-700' }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                  style={{ background: brand === b.id ? 'rgba(255,255,255,0.15)' : b.color }}>
                  {b.abbr}
                </div>
                <span className="font-bold text-[14px]">{b.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── STEP 1: Model ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 max-h-[420px] overflow-y-auto pr-1">
              {(POPULAR_MODELS[brand] ?? []).map((m) => (
                <button
                  key={m}
                  onClick={() => { setModel(m); setCustomModel(''); }}
                  className={`flex items-center justify-between px-5 py-3.5 rounded-xl border-2 transition-all text-left ${ model === m ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-slate-200 bg-white hover:border-slate-400 text-zinc-700' }`}
                >
                  <span className="font-semibold text-sm">{m}</span>
                  {model === m && <Check size={16} />}
                </button>
              ))}
              <button
                onClick={() => setModel('Diğer')}
                className={`flex items-center justify-between px-5 py-3.5 rounded-xl border-2 transition-all ${ model === 'Diğer' ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-slate-200 bg-white hover:border-slate-400 text-zinc-700' }`}
              >
                <span className="font-semibold text-sm">Listede yok — Manuel gir</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {model === 'Diğer' && (
              <input
                type="text"
                placeholder="Model adını yazın..."
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-200 focus:border-zinc-900 focus:outline-none text-sm font-semibold mt-2"
                autoFocus
              />
            )}

            {/* Storage & Color */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Depolama</label>
                <select value={storage} onChange={(e) => setStorage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-zinc-900 focus:outline-none text-sm bg-white">
                  <option value="">Seçin</option>
                  {['32GB','64GB','128GB','256GB','512GB','1TB'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Renk</label>
                <input type="text" placeholder="Örn: Siyah" value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-zinc-900 focus:outline-none text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Durum ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Grade */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Kozmetik Durum</p>
              <div className="grid grid-cols-2 gap-3">
                {GRADES.map((g) => (
                  <button key={g.id} onClick={() => setGrade(g.id)}
                    className="p-4 rounded-2xl border-2 text-left transition-all"
                    style={{
                      borderColor: grade === g.id ? g.color : 'rgba(226,232,240,1)',
                      background:  grade === g.id ? g.bg : '#fff',
                    }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-lg" style={{ color: g.color }}>{g.id}</span>
                      {grade === g.id && <Check size={16} style={{ color: g.color }} />}
                    </div>
                    <p className="font-bold text-[13px] text-zinc-900">{g.label}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Battery */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Battery size={14} /> Pil Sağlığı (%)
              </label>
              <input type="number" min="0" max="100" placeholder="Örn: 87"
                value={battery} onChange={(e) => setBattery(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-32 px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-zinc-900 focus:outline-none text-sm font-bold text-center" />
            </div>

            {/* Accessories */}
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Aksesuar / Ek Bilgi</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'hasBox',    state: hasBox,    set: setHasBox,    icon: Package,  label: 'Kutu'  },
                  { key: 'hasInvoice',state: hasInvoice, set: setHasInvoice,icon: FileText, label: 'Fatura'},
                  { key: 'hasAcc',    state: hasAcc,    set: setHasAcc,    icon: Zap,      label: 'Aksesuar'},
                ].map(({ key, state, set, icon: Icon, label }) => (
                  <button key={key} onClick={() => set(!state)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${ state ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-zinc-500' }`}>
                    <Icon size={20} />
                    <span className="text-xs font-bold">{label}</span>
                    {state && <Check size={12} className="text-violet-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Açıklama (Opsiyonel)</label>
              <textarea rows={3} placeholder="Cihaz hakkında eklemek istediğiniz bilgiler..."
                value={desc} onChange={(e) => setDesc(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-zinc-900 focus:outline-none text-sm resize-none" />
            </div>
          </div>
        )}

        {/* ── STEP 3: Fotoğraflar ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">En az 2, en fazla 6 fotoğraf yükleyin. Ön, arka, köşe ve ekran fotoğrafları tercih edilir.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">Önemli: Görsellerde bayi etiketi / sticker olmamalı</p>
                <p className="text-sm text-amber-700">Fotoğraflarınızda bayi etiketi, mağaza logosu veya sticker görünüyorsa talebiniz admin onayından geçemez. Etiketleri çıkardıktan sonra fotoğraf çekin.</p>
              </div>
            </div>

            {/* Upload area */}
            <button onClick={() => fileRef.current?.click()} disabled={uploading || images.length >= 6}
              className="w-full border-2 border-dashed border-slate-300 rounded-2xl py-12 flex flex-col items-center gap-3 hover:border-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {uploading ? (
                <Loader2 size={32} className="text-zinc-400 animate-spin" />
              ) : (
                <Upload size={32} className="text-zinc-400" />
              )}
              <p className="text-zinc-600 font-semibold text-sm">{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</p>
              <p className="text-zinc-400 text-xs">{images.length}/6 yüklendi</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center hover:bg-black transition-colors">
                      <X size={13} className="text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 text-[10px] bg-zinc-900/80 text-white px-2 py-0.5 rounded-full font-bold">Ana Fotoğraf</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Onay ─────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Images preview */}
              {images.length > 0 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt="" className={`rounded-xl object-cover shrink-0 ${i === 0 ? 'w-32 h-32' : 'w-20 h-20'}`} />
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-5 space-y-3 border-t border-slate-100">
                {[
                  ['Marka', brand],
                  ['Model', finalModel],
                  ['Depolama', storage || '—'],
                  ['Renk', color || '—'],
                  ['Kozmetik Durum', `${grade} — ${GRADES.find(g => g.id === grade)?.label}`],
                  ['Pil Sağlığı', battery !== '' ? `%${battery}` : '—'],
                  ['Kutu', hasBox ? 'Var' : 'Yok'],
                  ['Fatura', hasInvoice ? 'Var' : 'Yok'],
                  ['Aksesuar', hasAcc ? 'Var' : 'Yok'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-zinc-500">{k}</span>
                    <span className="font-semibold text-zinc-900">{v}</span>
                  </div>
                ))}
                {desc && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-zinc-500 mb-1">Açıklama</p>
                    <p className="text-sm text-zinc-700">{desc}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-violet-600" />
                <span className="font-bold text-violet-800">30 Dakikalık Teklif Süreci</span>
              </div>
              <p className="text-violet-700 text-sm leading-relaxed">
                Talebiniz gönderildikten sonra tüm aktif bayilere bildirim gidecek.
                30 dakika içinde gelen teklifler arasından en yüksek fiyatı seçebilirsiniz.
                Email ve hesabınızdan takip edebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 rounded-xl border-2 border-slate-200 text-zinc-700 font-bold text-sm hover:border-zinc-400 transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Geri
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3.5 rounded-xl bg-zinc-900 text-white font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              Devam Et <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createRequest.isPending}
              className="flex-1 py-3.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25">
              {createRequest.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</>
              ) : (
                <><Check size={16} /> Talebi Gönder</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
