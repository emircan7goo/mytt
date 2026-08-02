'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ArrowRight, Check, Upload, X, Smartphone,
  Package, FileText, Zap, Battery, Camera, ChevronRight,
  Clock, Loader2, Star, AlertCircle, Shield, TrendingUp,
  UserCheck, Lock, UserPlus, LogIn
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useCreateSellRequest, useMySellRequest } from '@/lib/hooks/useSellRequests';
import apiClient, { API_BASE } from '@/lib/api';

// ── Sabit veriler ─────────────────────────────────────────────────────────────
const BRANDS = [
  { id: 'Apple',   label: 'Apple',   color: "var(--k-ink)", abbr: 'A' },
  { id: 'Samsung', label: 'Samsung', color: '#1428a0', abbr: 'S' },
  { id: 'Xiaomi',  label: 'Xiaomi',  color: '#ff6900', abbr: 'X' },
  { id: 'Google',  label: 'Google',  color: '#4285f4', abbr: 'G' },
  { id: 'Huawei',  label: 'Huawei',  color: '#cf0a2c', abbr: 'H' },
  { id: 'OnePlus', label: 'OnePlus', color: '#f5010c', abbr: 'O' },
  { id: 'Diğer',   label: 'Diğer',   color: "var(--k-ink-3)", abbr: '?' },
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
  { id: 'A+', label: 'Tertemiz',   desc: 'Sıfır gibi, çizik yok',              color: '#F97316', bg: 'rgba(249,115,22,0.08)',  border: 'rgba(249,115,22,0.25)' },
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

          {/* Admin Onayı Durumu */}
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

          {/* Sayaç */}
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

          {/* Canlı Teklif Sayacı */}
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

          {/* Detaylar */}
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
  const { user, setShowAuthModal } = useApp();
  const createRequest = useCreateSellRequest();

  const [step, setStep]         = useState(0);
  const [done, setDone]         = useState(false);
  const [created, setCreated]   = useState<any>(null);
  const [showAuthGateModal, setShowAuthGateModal] = useState(false);

  // Form state
  const [brand,       setBrand]       = useState('');
  const [model,       setModel]       = useState('');
  const [customModel, setCustomModel] = useState('');
  const [storage,     setStorage]     = useState('');
  const [color,       setColor]       = useState('');
  const [grade,       setGrade]       = useState('');
  const [battery,     setBattery]     = useState<number | ''>('');
  const [hasBox,      setHasBox]      = useState(false);
  const [hasInvoice,  setHasInvoice]  = useState(false);
  const [hasAcc,      setHasAcc]      = useState(false);
  const [desc,        setDesc]        = useState('');
  const [images,      setImages]      = useState<string[]>([]);
  const [uploading,   setUploading]   = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const finalModel = model === 'Diğer' ? customModel : model;

  // ── Session Storage Draft Restoring ──────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mytt_sell_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.brand) setBrand(parsed.brand);
        if (parsed.model) setModel(parsed.model);
        if (parsed.customModel) setCustomModel(parsed.customModel);
        if (parsed.storage) setStorage(parsed.storage);
        if (parsed.color) setColor(parsed.color);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.battery !== undefined) setBattery(parsed.battery);
        if (parsed.hasBox !== undefined) setHasBox(parsed.hasBox);
        if (parsed.hasInvoice !== undefined) setHasInvoice(parsed.hasInvoice);
        if (parsed.hasAcc !== undefined) setHasAcc(parsed.hasAcc);
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
          brand, model, customModel, storage, color, grade, battery,
          hasBox, hasInvoice, hasAcc, desc, images, step
        }));
      }
    } catch {}
  }, [brand, model, customModel, storage, color, grade, battery, hasBox, hasInvoice, hasAcc, desc, images, step]);

  // ── Form gönder ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!user) {
      setShowAuthGateModal(true);
      return;
    }
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
      sessionStorage.removeItem('mytt_sell_draft');
      setCreated(result);
      setDone(true);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Bir hata oluştu, lütfen tekrar deneyin.');
    }
  };

  // Auto-submit after returning logged in
  useEffect(() => {
    if (user && (autoSubmit || showAuthGateModal) && brand && (model || customModel) && grade) {
      setShowAuthGateModal(false);
      handleSubmit();
    }
  }, [user, autoSubmit]);

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
    if (step === 1) return !!(model || customModel);
    if (step === 2) return !!grade;
    if (step === 3) return images.length >= 0; // Fotoğraf opsiyonel veya önerili
    return true;
  };

  // ── Başarı ekranı ────────────────────────────────────────────────────────
  if (done && created) {
    return <SellSuccessScreen created={created} brand={brand} model={finalModel} router={router} />;
  }

  // ── Ana form ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--k-canvas)] pt-24 pb-20 relative">
      
      {/* AUTH PROMPT MODAL (TAM İHALEYE GÖNDERİRKEN GÖSTERİLEN ŞEFFAF KAYIT/GİRİŞ MODALI) */}
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
                  📱 {brand} {finalModel} ({GRADES.find(g => g.id === grade)?.label || grade})
                </p>
              </div>

              <p className="text-xs text-[var(--k-ink-3)] font-medium leading-relaxed pt-1">
                İhalenizi 150+ onaylı yetkili bayiye anında başlatıp canlı teklifleri izlemek ve paranızın yatacağı banka hesabını belirlemek için hemen giriş yapın veya 10 saniyede ücretsiz hesap oluşturun.
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

      {/* Header */}
      <div className="max-w-2xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors mb-8 text-sm">
          <ArrowLeft size={16} />
          Ana Sayfa
        </Link>

        <div className="mb-2">
          <h1 className="text-3xl font-black text-[var(--k-ink)] tracking-tight">
            {isTradeIn ? 'Takas Talebi Oluştur' : 'Cihazını İhaleye Çıkar'}
          </h1>
          <p className="text-[var(--k-ink-3)] text-sm mt-1 font-medium">
            150+ onaylı bayiden anında canlı teklif almak için bilgileri tamamlayın.
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between my-8 relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-[var(--k-line)] -translate-y-1/2 -z-0" />
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const past   = i < step;
            return (
              <button
                key={s.label}
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`relative z-10 flex flex-col items-center gap-1 group ${i > step ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  past   ? 'bg-[var(--k-hot)] text-white shadow-md' :
                  active ? 'bg-[var(--k-hot)] text-white ring-4 ring-[var(--k-hot-wash)] scale-110 shadow-lg shadow-[var(--k-hot-glow)]/30' :
                           'bg-[var(--k-surface-2)] text-[var(--k-ink-4)] border border-[var(--k-line)]'
                }`}>
                  {past ? <Check size={16} strokeWidth={3} /> : <Icon size={18} />}
                </div>
                <span className={`text-xs font-semibold ${active ? 'text-[var(--k-hot)]' : past ? 'text-[var(--k-ink-2)]' : 'text-[var(--k-ink-4)]'}`}>
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── STEP 0: Marka ────────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--k-ink)] mb-4">Cihazınızın Markasını Seçin</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BRANDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => { setBrand(b.id); setModel(''); setCustomModel(''); setStep(1); }}
                  className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] flex items-center justify-between ${
                    brand === b.id
                      ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)] shadow-md shadow-[var(--k-hot-glow)]/10'
                      : 'border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line-2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--k-surface-2)] flex items-center justify-center font-black text-lg text-[var(--k-ink)]">
                      {b.abbr}
                    </div>
                    <span className="font-bold text-[var(--k-ink)]">{b.label}</span>
                  </div>
                  {brand === b.id && <Check size={18} className="text-[var(--k-hot)]" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Model ────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--k-ink)]">Model ve Depolama Seçin</h2>
              <span className="text-xs font-semibold text-[var(--k-hot)] bg-[var(--k-hot-wash)] px-2.5 py-1 rounded-full border border-[var(--k-line-hot)]">
                {brand}
              </span>
            </div>

            {/* Popüler Modeller */}
            {(POPULAR_MODELS[brand] ?? []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(POPULAR_MODELS[brand] ?? []).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setModel(m); setCustomModel(''); }}
                    className={`p-4 rounded-xl border text-left transition-all font-semibold text-sm flex items-center justify-between ${
                      model === m
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)] text-[var(--k-hot)] font-bold'
                        : 'border-[var(--k-line)] bg-[var(--k-surface)] text-[var(--k-ink)] hover:border-[var(--k-line-2)]'
                    }`}
                  >
                    <span>{m}</span>
                    {model === m && <Check size={16} className="text-[var(--k-hot)]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Manuel Giriş */}
            <div className="pt-2">
              <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block mb-2">
                Listede yoksa elle yazın
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => { setCustomModel(e.target.value); setModel('Diğer'); }}
                placeholder="Örn: iPhone SE 2022 veya Galaxy Z Fold 4"
                className="w-full p-4 rounded-xl bg-[var(--k-surface)] border border-[var(--k-line-2)] text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:outline-none focus:border-[var(--k-hot)] text-sm font-medium"
              />
            </div>

            {/* Depolama & Renk */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block mb-2">Depolama</label>
                <select
                  value={storage}
                  onChange={(e) => setStorage(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-line-2)] text-[var(--k-ink)] text-sm font-medium focus:outline-none focus:border-[var(--k-hot)]"
                >
                  <option value="">Seçiniz</option>
                  {['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block mb-2">Renk</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Örn: Uzay Siyahı"
                  className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-line-2)] text-[var(--k-ink)] text-sm font-medium placeholder-[var(--k-ink-4)] focus:outline-none focus:border-[var(--k-hot)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Durum ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-[var(--k-ink)]">Cihazın Durumunu Belirtin</h2>

            {/* Kozmetik Derece */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider">Kozmetik Durumu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GRADES.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGrade(g.id)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      grade === g.id
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)]'
                        : 'border-[var(--k-line)] bg-[var(--k-surface)] hover:border-[var(--k-line-2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-[var(--k-ink)]">{g.label} ({g.id})</span>
                      {grade === g.id && <Check size={16} className="text-[var(--k-hot)]" />}
                    </div>
                    <p className="text-xs text-[var(--k-ink-3)] font-medium">{g.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Pil Sağlığı */}
            <div>
              <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block mb-2">
                Pil Sağlığı (%) — Opsiyonel
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={battery}
                onChange={(e) => setBattery(e.target.value ? Number(e.target.value) : '')}
                placeholder="Örn: 88"
                className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-line-2)] text-[var(--k-ink)] text-sm font-medium placeholder-[var(--k-ink-4)] focus:outline-none focus:border-[var(--k-hot)]"
              />
            </div>

            {/* Kutu & Fatura & Aksesuar */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block">Kutu / Fatura / Aksesuar</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Kutu Var', state: hasBox, setState: setHasBox },
                  { label: 'Fatura Var', state: hasInvoice, setState: setHasInvoice },
                  { label: 'Aksesuar Var', state: hasAcc, setState: setHasAcc },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.setState(!item.state)}
                    className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      item.state
                        ? 'border-[var(--k-hot)] bg-[var(--k-hot-wash)] text-[var(--k-hot)]'
                        : 'border-[var(--k-line)] bg-[var(--k-surface)] text-[var(--k-ink-3)] hover:border-[var(--k-line-2)]'
                    }`}
                  >
                    {item.state && <Check size={14} />}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider block mb-2">Ek Açıklama (İsteğe Bağlı)</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                placeholder="Cihazdaki ek detaylar, kılcal çizik durumu vb..."
                className="w-full p-3.5 rounded-xl bg-[var(--k-surface)] border border-[var(--k-line-2)] text-[var(--k-ink)] text-sm font-medium placeholder-[var(--k-ink-4)] focus:outline-none focus:border-[var(--k-hot)] resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Fotoğraf ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[var(--k-ink)]">Fotoğraf Yükleyin</h2>
              <p className="text-xs text-[var(--k-ink-3)] mt-1 font-medium">
                Cihazınızın ön, arka ve kenar açılarını net çeken fotoğraflar ekleyin. (Önerilen: En az 2 fotoğraf)
              </p>
            </div>

            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full p-8 border-2 border-dashed border-[var(--k-line-2)] hover:border-[var(--k-hot)] bg-[var(--k-surface)] rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 size={32} className="text-[var(--k-ink-4)] animate-spin" />
              ) : (
                <Upload size={32} className="text-[var(--k-ink-4)]" />
              )}
              <p className="text-[var(--k-ink-2)] font-semibold text-sm">{uploading ? 'Yükleniyor...' : 'Fotoğraf Seç'}</p>
              <p className="text-[var(--k-ink-4)] text-xs">{images.length}/6 yüklendi</p>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

            {/* Image previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--k-line)] bg-[var(--k-surface-3)]">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-2 right-2 w-7 h-7 bg-[var(--k-void)]/70 rounded-full flex items-center justify-center hover:bg-[var(--k-void)] transition-colors">
                      <X size={13} className="text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-2 left-2 text-[10px] bg-[var(--k-canvas)]/80 text-white px-2 py-0.5 rounded-full font-bold">Ana Fotoğraf</span>
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
            <div className="bg-[var(--k-surface)] rounded-2xl border border-[var(--k-line)] overflow-hidden">
              {/* Images preview */}
              {images.length > 0 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt="" className={`rounded-xl object-cover shrink-0 ${i === 0 ? 'w-32 h-32' : 'w-20 h-20'}`} />
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="p-5 space-y-3 border-t border-[var(--k-line)]">
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
                    <span className="text-[var(--k-ink-3)]">{k}</span>
                    <span className="font-semibold text-[var(--k-ink)]">{v}</span>
                  </div>
                ))}
                {desc && (
                  <div className="pt-2 border-t border-[var(--k-line)]">
                    <p className="text-xs text-[var(--k-ink-3)] mb-1">Açıklama</p>
                    <p className="text-sm text-[var(--k-ink-2)]">{desc}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[var(--k-hot-wash)] border border-[var(--k-line-hot)] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={18} className="text-[var(--k-hot)]" />
                <span className="font-bold text-[var(--k-hot)]">1 Saatlik Canlı İhale Süreci</span>
              </div>
              <p className="text-[var(--k-hot)] text-sm leading-relaxed">
                Talebiniz gönderildikten sonra tüm onaylı yetkili bayilere anında bildirim gider.
                İhale süresi boyunca gelen teklifler arasından en yüksek fiyatı seçip onaylayabilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)}
              className="px-6 py-3.5 rounded-xl border-2 border-[var(--k-line)] text-[var(--k-ink-2)] font-bold text-sm hover:border-[var(--k-line-2)] transition-colors flex items-center gap-2">
              <ArrowLeft size={16} /> Geri
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex-1 py-3.5 rounded-xl bg-[var(--k-canvas)] text-white font-bold text-sm hover:bg-[var(--k-void)] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              Devam Et <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={createRequest.isPending}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[var(--k-hot)] via-[var(--k-hot)] to-[var(--k-hot-deep)] text-white font-black text-sm hover:from-[var(--k-hot-deep)] hover:to-[var(--k-hot-deep)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-[var(--k-hot-glow)]/30">
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
