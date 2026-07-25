'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { useApp } from '@/providers/AppProvider';
import { toast } from 'sonner';
import {
  CreditCard, PackageCheck, Truck, ShieldCheck,
  ChevronRight, ShoppingBag, User, Lock,
  Save, Loader2, CheckCircle2, Eye, EyeOff,
  Smartphone, Clock, Check, X, Package, ArrowRight,
  Heart, Trash2, RefreshCw,
} from 'lucide-react';
import { useWishlist, useWishlistToggle } from '@/lib/hooks/useWishlist';
import DealerTrustBadge from '@/components/DealerTrustBadge';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { useMySellRequests, useAcceptBid, useRejectAllBids, useAddShippingCode } from '@/lib/hooks/useSellRequests';
import type { SellRequest } from '@/lib/hooks/useSellRequests';

// ── Format yardımcısı ─────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

// ── Sipariş durum haritası ────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; step: number; color: string }> = {
  PENDING:  { label: 'Ödeme Bekleniyor', step: 0, color: '#f59e0b' },
  ESCROW:   { label: 'Ödeme Alındı',     step: 1, color: '#0ea5e9' },
  RELEASED: { label: 'Teslim Edildi',    step: 3, color: '#8B5CF6' },
  REFUNDED: { label: 'İade Edildi',      step: 0, color: '#ef4444' },
  CANCELLED:{ label: 'İptal Edildi',     step: 0, color: '#ef4444' },
};

const STEPS = [
  { key: 'payment', label: 'Ödeme Alındı',    icon: <CreditCard size={14} /> },
  { key: 'ops',     label: 'Operasyonda',      icon: <PackageCheck size={14} /> },
  { key: 'shipped', label: 'Kargoda / Teslim', icon: <Truck size={14} /> },
];

// ── Sipariş kartı ─────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: any }) {
  const statusCfg  = STATUS_MAP[order.paymentStatus] ?? STATUS_MAP.ESCROW;
  const currentStep = statusCfg.step;

  const orderDate  = new Date(order.createdAt);
  const warrantyEnd = new Date(orderDate);
  warrantyEnd.setMonth(warrantyEnd.getMonth() + 6);
  const warrantyDays = Math.max(0, Math.floor((warrantyEnd.getTime() - Date.now()) / 86_400_000));
  const warrantyPct  = Math.round((warrantyDays / 180) * 100);
  const warrantyColor = warrantyDays > 90 ? '#8B5CF6' : warrantyDays > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      {/* Başlık */}
      <div className="flex justify-between items-start mb-5 gap-3">
        <div>
          <div className="text-slate-900 font-bold text-[15px] mb-1">
            {order.product
              ? `${order.product.brand ?? ''} ${order.product.model ?? ''}`.trim() || 'Ürün'
              : order.dealerStock?.globalProduct
                ? `${order.dealerStock.globalProduct.brand ?? ''} ${order.dealerStock.globalProduct.model ?? ''}`.trim() || 'Ürün'
                : 'Ürün bilgisi yok'}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            #{order.id.slice(0, 8).toUpperCase()}
            <span>·</span>
            {fmt(Number(order.amount))}
          </div>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: `${statusCfg.color}18`, color: statusCfg.color, border: `1px solid ${statusCfg.color}33` }}>
          {statusCfg.label}
        </span>
      </div>

      {/* Progress */}
      {!['REFUNDED','CANCELLED','PENDING'].includes(order.paymentStatus) && (
        <div className="relative mb-5 px-2">
          <div className="flex items-center">
            {STEPS.map((step, idx) => {
              const isDone   = idx < currentStep;
              const isActive = idx === currentStep - 1 || (currentStep === 3 && idx === 2);
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center relative">
                  {idx > 0 && (
                    <div className="absolute top-[15px] left-[-50%] w-full h-[2px]"
                      style={{ background: isDone ? 'linear-gradient(90deg,#8B5CF6,#0ea5e9)' : 'rgba(15,23,42,0.08)' }} />
                  )}
                  <div className="w-[30px] h-[30px] rounded-full z-10 relative flex items-center justify-center"
                    style={{
                      background: isDone ? (isActive ? 'linear-gradient(135deg,#0ea5e9,#0284c7)' : '#8B5CF6') : 'rgba(15,23,42,0.06)',
                      border: isDone ? 'none' : '2px solid rgba(15,23,42,0.1)',
                      color: isDone ? 'white' : 'rgba(15,23,42,0.3)',
                      boxShadow: isActive ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
                    }}>
                    {step.icon}
                  </div>
                  <div className="mt-2 text-center max-w-[70px]">
                    <div className="text-[10px] leading-tight"
                      style={{ fontWeight: isActive ? 700 : 500, color: isActive ? '#0284c7' : isDone ? '#7C3AED' : 'rgba(15,23,42,0.3)' }}>
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Garanti */}
      {order.paymentStatus === 'RELEASED' && (
        <div className="p-3 rounded-xl" style={{ background: warrantyDays < 30 ? 'rgba(239,68,68,0.04)' : 'rgba(16,185,129,0.04)', border: `1px solid ${warrantyColor}22` }}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ShieldCheck size={13} style={{ color: warrantyColor }} />
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: warrantyColor }}>6 Ay Garanti</p>
          </div>
          <div className="text-lg font-black text-slate-900 mb-1.5">
            {warrantyDays} <span className="text-xs font-medium text-slate-400">gün kaldı</span>
          </div>
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${warrantyPct}%`, background: `linear-gradient(90deg,${warrantyColor},${warrantyColor}bb)` }} />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Bitiş: {warrantyEnd.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}

// ── Profil sekmesi ────────────────────────────────────────────────────────────
function ProfileTab() {
  const { user, login } = useApp();
  const [name,       setName]       = useState(user?.name ?? '');
  const [saving,     setSaving]     = useState(false);

  const [curPwd,     setCurPwd]     = useState('');
  const [newPwd,     setNewPwd]     = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [pwdSaving,  setPwdSaving]  = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data } = await apiClient.patch('/users/me', { name });
      login({ ...user!, name: data.name });
      toast.success('Profil güncellendi');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.error?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Hata oluştu'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd.length < 6) { toast.error('Yeni şifre en az 6 karakter olmalı'); return; }
    setPwdSaving(true);
    try {
      await apiClient.patch('/users/me/password', { currentPassword: curPwd, newPassword: newPwd });
      setPwdSuccess(true);
      setCurPwd(''); setNewPwd('');
      toast.success('Şifreniz güncellendi');
      setTimeout(() => setPwdSuccess(false), 3000);
    } catch (err: any) {
      const d   = err?.response?.data;
      const msg = d?.message ?? d?.error?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? 'Mevcut şifre hatalı'));
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-lg">
      {/* Hesap bilgileri */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <User size={16} className="text-blue-600" /> Hesap Bilgileri
        </h3>
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ad Soyad</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              placeholder="Adınız Soyadınız"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">E-posta</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="border border-slate-100 rounded-xl px-4 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400">E-posta adresi değiştirilemez</p>
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim() || name === user?.name}
            className="self-start flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Kaydet
          </button>
        </form>
      </div>

      {/* Şifre değiştir */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Lock size={16} className="text-amber-500" /> Şifre Değiştir
        </h3>
        {pwdSuccess ? (
          <div className="flex items-center gap-2 text-violet-600 bg-violet-50 rounded-xl p-4 text-sm font-semibold">
            <CheckCircle2 size={16} /> Şifreniz başarıyla güncellendi
          </div>
        ) : (
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mevcut Şifre</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={curPwd}
                  onChange={e => setCurPwd(e.target.value)}
                  required
                  className="w-full border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none transition-colors"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Yeni Şifre</label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                minLength={6}
                required
                placeholder="En az 6 karakter"
                className="border border-slate-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={pwdSaving || !curPwd || !newPwd}
              className="self-start flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
            >
              {pwdSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              Şifreyi Güncelle
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(expiresAt: string) {
  const calc = () => Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const total = Math.max(0, ms);
  const m = Math.floor(total / 60000);
  const s = Math.floor((total % 60000) / 1000);
  return { ms: total, label: `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` };
}

// ── Satış Talebi Durumu ───────────────────────────────────────────────────────
const SELL_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Teklif Bekleniyor', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  EXPIRED:   { label: 'Teklifler Kapandı', color: '#6366f1', bg: 'rgba(99,102,241,0.1)'  },
  ACCEPTED:  { label: 'Teklif Kabul Edildi', color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)' },
  REJECTED:  { label: 'Reddedildi',         color: '#ef4444', bg: 'rgba(239,68,68,0.1)'  },
  SHIPPED:   { label: 'Kargoya Verildi',    color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  RECEIVED:  { label: 'Depoda — İnceleniyor', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  COMPLETED: { label: 'Tamamlandı',         color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)' },
  CANCELLED: { label: 'İptal Edildi',       color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

function SellRequestCard({ req }: { req: SellRequest }) {
  const status      = SELL_STATUS[req.status] ?? SELL_STATUS.PENDING;
  const acceptBid   = useAcceptBid();
  const rejectAll   = useRejectAllBids();
  const addShipping = useAddShippingCode();
  const [shippingCode, setShippingCode] = useState('');
  const [showShip, setShowShip]         = useState(false);
  const { ms: timeLeftMs, label: countdown } = useCountdown(req.expiresAt);

  const sortedBids = [...(req.bids ?? [])].sort((a, b) => Number(b.amount) - Number(a.amount));
  const isLive     = req.status === 'PENDING' && timeLeftMs > 0;
  const canDecide  = req.status === 'EXPIRED' || (req.status === 'PENDING' && sortedBids.length > 0);
  const isTradeIn  = (req as any).requestType === 'TRADE_IN';

  const handleAccept = async (bidId: string) => {
    if (!confirm('Bu teklifi kabul etmek istediğinize emin misiniz?')) return;
    try {
      await acceptBid.mutateAsync({ requestId: req.id, bidId });
      toast.success('Teklif kabul edildi! E-posta ile kargo bilgileri gönderilecek.');
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleReject = async () => {
    if (!confirm('Tüm teklifleri reddetmek istediğinize emin misiniz?')) return;
    try {
      await rejectAll.mutateAsync(req.id);
      toast.success('Tüm teklifler reddedildi.');
    } catch { toast.error('İşlem başarısız'); }
  };

  const handleShipping = async () => {
    if (!shippingCode.trim()) return;
    try {
      await addShipping.mutateAsync({ requestId: req.id, shippingCode });
      toast.success('Kargo kodu kaydedildi!');
      setShowShip(false);
    } catch { toast.error('Kargo kodu kaydedilemedi'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Top stripe */}
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}88)` }} />
      <div className="p-5">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex gap-3 items-center">
            {req.imagesUrl?.[0] ? (
              <img src={req.imagesUrl[0]} alt="" className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
                <Smartphone size={24} className="text-slate-300" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-[15px]">{req.brand} {req.model}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {[req.storage, req.color, `Grade ${req.grade}`].filter(Boolean).join(' · ')}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-slate-400 text-xs font-mono">#{req.id.slice(0,8).toUpperCase()}</span>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={isTradeIn
                    ? { background: 'rgba(37,99,235,0.1)', color: '#1d4ed8' }
                    : { background: 'rgba(16,185,129,0.1)', color: '#7C3AED' }}
                >
                  {isTradeIn ? '⇄ TAKAS' : '↑ SATIŞ'}
                </span>
              </div>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold"
            style={{ background: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>

        {/* Countdown (PENDING & alive) */}
        {isLive && (
          <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
            style={{ background: 'linear-gradient(135deg,#fef3c7,#fef9c3)', border: '1px solid #fde68a' }}>
            <div className="flex flex-col items-center shrink-0">
              <span className="text-2xl font-black text-amber-700 tabular-nums leading-none">{countdown}</span>
              <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider mt-0.5">kalan süre</span>
            </div>
            <div>
              <p className="text-amber-800 text-xs font-bold">Teklif süreci devam ediyor</p>
              <p className="text-amber-600 text-[11px]">Bayiler anonim teklif veriyor — süre dolunca karar verebilirsiniz</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          </div>
        )}

        {/* No bids yet */}
        {req.status === 'PENDING' && sortedBids.length === 0 && (
          <div className="mb-3 text-center py-5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-slate-400 text-xs mt-2">Bayiler teklif hazırlıyor...</p>
          </div>
        )}

        {/* Anonymous Bid Feed */}
        {sortedBids.length > 0 && (canDecide || isLive) && (
          <div className="mb-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
              {sortedBids.length} Teklif Geldi
            </p>
            <div className="flex flex-col gap-2">
              {sortedBids.map((bid: any, i) => (
                <div key={bid.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    i === 0
                      ? 'border-violet-200 bg-gradient-to-r from-violet-50 to-white'
                      : 'border-slate-100 bg-slate-50'
                  }`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-base leading-none">🏆</span>}
                    <div>
                      <p className={`font-bold text-sm ${i === 0 ? 'text-violet-800' : 'text-slate-600'}`}>
                        {bid.dealerTag ?? `Bayi #${i + 1}`}
                      </p>
                      {bid.note && <p className="text-xs text-slate-400 italic">"{bid.note}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-base ${i === 0 ? 'text-violet-700' : 'text-slate-700'}`}>
                      {Number(bid.amount).toLocaleString('tr-TR')} ₺
                    </span>
                    {req.status === 'EXPIRED' && i === 0 && (
                      <button onClick={() => handleAccept(bid.id)}
                        disabled={acceptBid.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 text-white rounded-lg text-xs font-bold hover:bg-violet-700 transition-colors disabled:opacity-50">
                        <Check size={11} /> Kabul Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {req.status === 'EXPIRED' && sortedBids.length > 0 && (
              <button onClick={handleReject} disabled={rejectAll.isPending}
                className="mt-2 w-full py-2.5 rounded-xl border-2 border-rose-200 text-rose-500 text-xs font-bold hover:bg-rose-50 transition-colors">
                Tüm Teklifleri Reddet
              </button>
            )}
          </div>
        )}

        {/* ACCEPTED — shipping */}
        {req.status === 'ACCEPTED' && (
          <div className="mb-4">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 mb-3">
              <p className="text-blue-800 text-xs font-bold mb-1">
                Kabul Edilen Teklif: {req.finalPrice ? `${Number(req.finalPrice).toLocaleString('tr-TR')} ₺` : '—'}
              </p>
              <p className="text-blue-700 text-xs">Cihazınızı Mytt deposuna kargolayın. Kargo kodunuzu girin.</p>
            </div>
            {req.shippingCode ? (
              <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 border border-violet-100 rounded-xl p-3">
                <Package size={14} />
                <span>Kargo Kodu: <strong className="font-mono">{req.shippingCode}</strong></span>
              </div>
            ) : !showShip ? (
              <button onClick={() => setShowShip(true)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">
                Kargo Kodu Gir
              </button>
            ) : (
              <div className="flex gap-2">
                <input type="text" value={shippingCode} onChange={e => setShippingCode(e.target.value)}
                  placeholder="Kargo takip kodu..."
                  className="flex-1 border border-slate-200 focus:border-slate-900 rounded-xl px-3 py-2 text-sm outline-none" />
                <button onClick={handleShipping} disabled={!shippingCode || addShipping.isPending}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                  {addShipping.isPending ? '...' : 'Kaydet'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* COMPLETED */}
        {req.status === 'COMPLETED' && (
          <div className="mb-4 p-3 rounded-xl bg-violet-50 border border-violet-100 flex items-center gap-2">
            <Check size={16} className="text-violet-600" />
            <div>
              <p className="text-violet-800 text-xs font-bold">İşlem Tamamlandı</p>
              <p className="text-violet-700 text-xs">Nihai ödeme: {req.finalPrice ? `${Number(req.finalPrice).toLocaleString('tr-TR')} ₺` : '—'}</p>
            </div>
          </div>
        )}

        <p className="text-slate-400 text-[11px]">
          {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ── Satış Talepleri Sekmesi ───────────────────────────────────────────────────
function SellRequestsTab() {
  const { data: requests, isLoading } = useMySellRequests();
  const sellOnly = requests?.filter(r => !r.requestType || r.requestType === 'SELL') ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-xl font-bold mb-1">Satış Taleplerim</h2>
          <p className="text-slate-400 text-sm">Cihaz satış talepleriniz ve gelen teklifler</p>
        </div>
        <Link href="/sell"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-700 transition-colors">
          <Smartphone size={13} /> Yeni Talep
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" />
          Yükleniyor...
        </div>
      ) : !sellOnly.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Smartphone size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm mb-1">Henüz satış talebi yok</p>
          <p className="text-slate-400 text-xs mb-4">Elinizdeki cihazı satmak için talep oluşturun.</p>
          <Link href="/sell"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
            Cihazımı Sat <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sellOnly.map(req => <SellRequestCard key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}

// ── Takas Talepleri Sekmesi ───────────────────────────────────────────────────
function TradeInTab() {
  const { data: requests, isLoading } = useMySellRequests();
  const tradeOnly = requests?.filter(r => r.requestType === 'TRADE_IN') ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-xl font-bold mb-1">Takas Taleplerim</h2>
          <p className="text-slate-400 text-sm">Cihaz takas talepleriniz ve gelen teklifler</p>
        </div>
        <Link href="/sell?type=trade-in"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
          <RefreshCw size={13} /> Takas Talebi
        </Link>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
        <RefreshCw size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-slate-900 text-sm font-semibold mb-0.5">Takas Nasıl Çalışır?</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            Elinizdeki cihazı takas olarak değerlendirin. Bayiler anonim teklif verir, en yüksek teklifi kabul ederek yeni cihazınıza fark ödeyin.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" />
          Yükleniyor...
        </div>
      ) : !tradeOnly.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <RefreshCw size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm mb-1">Henüz takas talebi yok</p>
          <p className="text-slate-400 text-xs mb-4">Elinizdeki cihazı takasa vererek yeni cihazınıza ulaşın.</p>
          <Link href="/sell?type=trade-in"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-700 text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-colors">
            Takas Talebi Oluştur <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tradeOnly.map(req => <SellRequestCard key={req.id} req={req} />)}
        </div>
      )}
    </div>
  );
}

// ── Favoriler Sekmesi ─────────────────────────────────────────────────────────
function WishlistTab() {
  const { data: items, isLoading } = useWishlist();
  const { toggle } = useWishlistToggle();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (dealerStockId: string) => {
    setRemoving(dealerStockId);
    try {
      await toggle(dealerStockId, true);
      toast.success('Favorilerden çıkarıldı');
    } catch {
      toast.error('İşlem başarısız');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-900 text-xl font-bold mb-1">Favorilerim</h2>
          <p className="text-slate-400 text-sm">Beğendiğin ürünleri buradan takip et</p>
        </div>
        <Link href="/" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-500 border border-red-100 text-xs font-bold hover:bg-red-100 transition-colors">
          <Heart size={13} className="fill-red-400" /> Alışverişe Devam
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto mb-3" />
          Yükleniyor...
        </div>
      ) : !items?.length ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Heart size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-sm mb-1">Henüz favori ürün yok</p>
          <p className="text-slate-400 text-xs mb-4">Vitrinlerde kalp ikonuna basarak ürün favorile.</p>
          <Link href="/" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors">
            Ürünleri Keşfet <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(item => {
            const p   = item.product;
            const imgSrc = p.masterImage ? resolveUploadUrl(p.masterImage) : null;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex">
                {/* Görsel */}
                <Link href={`/product/${p.id}`} className="shrink-0 w-24 h-24 bg-slate-50 flex items-center justify-center overflow-hidden">
                  {imgSrc ? (
                    <img src={imgSrc} alt={`${p.brand} ${p.model}`} className="w-full h-full object-contain p-2" />
                  ) : (
                    <Smartphone size={32} className="text-slate-300" strokeWidth={1.5} />
                  )}
                </Link>

                {/* Bilgi */}
                <div className="flex flex-1 items-center justify-between px-4 py-3 gap-3 min-w-0">
                  <Link href={`/product/${p.id}`} className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.brand}{p.storage ? ` · ${p.storage}` : ''}</span>
                    <span className="font-bold text-[14px] text-slate-900 leading-snug truncate">{p.model}</span>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {p.grade && (
                        <span className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">{p.grade}</span>
                      )}
                      {p.store && (
                        <DealerTrustBadge rating={p.store.rating} isPremium={p.store.isPremium} />
                      )}
                    </div>
                  </Link>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[17px] font-black text-slate-900">{fmt(p.price)}</span>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/product/${p.id}`} className="px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-[11px] font-black hover:bg-black transition-colors">
                        İncele →
                      </Link>
                      <button
                        onClick={() => handleRemove(item.dealerStockId)}
                        disabled={removing === item.dealerStockId}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-300 hover:border-red-200 hover:text-red-400 transition-colors disabled:opacity-50"
                        aria-label="Favorilerden çıkar"
                      >
                        {removing === item.dealerStockId
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />
                        }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────
type Tab = 'orders' | 'sell-requests' | 'trade-in' | 'wishlist' | 'profile';

export default function HesabimPage() {
  // URL ?tab=sell-requests gibi parametreler ile gelen linkler çalışsın
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = (searchParams?.get('tab') as Tab) ?? 'orders';
  const [tab,     setTab]     = useState<Tab>(initialTab);
  const [orders,  setOrders]  = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAmount = orders.reduce((s, o) => s + Number(o.amount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Sekme seçici */}
      <div className="flex gap-2 bg-white border border-slate-100 rounded-2xl p-1.5 w-fit shadow-sm overflow-x-auto max-w-full">
        {([
          { key: 'orders',        label: 'Siparişlerim',     icon: <ShoppingBag size={14} /> },
          { key: 'sell-requests', label: 'Satış Taleplerim', icon: <Smartphone size={14} /> },
          { key: 'trade-in',      label: 'Takas Taleplerim', icon: <RefreshCw size={14} /> },
          { key: 'wishlist',      label: 'Favorilerim',      icon: <Heart size={14} /> },
          { key: 'profile',       label: 'Profilim',         icon: <User size={14} /> },
        ] as { key: Tab; label: string; icon: React.ReactNode }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${ tab === t.key ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900' }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Siparişler ── */}
      {tab === 'orders' && (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-slate-900 text-xl font-bold mb-1">Aktif Siparişlerim</h2>
              <p className="text-slate-400 text-sm">Sipariş durumu, garanti süresi ve kargo takibi</p>
            </div>
            <a href="/"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-500 text-white text-xs font-bold shadow-sm hover:bg-violet-600 transition-colors">
              Alışverişe Devam <ChevronRight size={13} />
            </a>
          </div>

          {!loading && orders.length > 0 && (
            <div className="grid grid-cols-3 gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              {[
                { label: 'Toplam Sipariş', value: orders.length.toString(), color: '#0f172a' },
                { label: 'Toplam Tutar',   value: fmt(totalAmount),         color: '#8B5CF6' },
                { label: 'Aktif Garanti',  value: `${orders.filter(o => o.paymentStatus === 'RELEASED').length} Cihaz`, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-black" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 text-slate-400">
              <Loader2 size={28} className="animate-spin mx-auto mb-3" />
              Siparişler yükleniyor…
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <ShoppingBag size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold text-sm">Henüz sipariş bulunmuyor</p>
              <p className="text-slate-400 text-xs mt-1">İlk alışverişini yapmak için ürünlere göz at</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map(order => <OrderCard key={order.id} order={order} />)}
            </div>
          )}

          <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-50 border border-violet-100">
            <ShieldCheck size={18} className="text-violet-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-900 text-sm font-semibold mb-0.5">6 Aylık Garanti Hakkında</p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Mytt garantisi kapsamındaki cihazlar profesyonel testten geçmiştir.
                Garanti süreniz dolmadan 30 gün önce e-posta ile bildirim alacaksınız.
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Satış Talepleri ── */}
      {tab === 'sell-requests' && <SellRequestsTab />}

      {/* ── Takas Talepleri ── */}
      {tab === 'trade-in' && <TradeInTab />}

      {/* ── Favoriler ── */}
      {tab === 'wishlist' && <WishlistTab />}

      {/* ── Profil ── */}
      {tab === 'profile' && <ProfileTab />}
    </div>
  );
}
