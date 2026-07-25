'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import MetricCard from '@/components/dashboard/MetricCard';
import EscrowCard from '@/components/dashboard/EscrowCard';
import PayoutRequestModal from '@/components/dashboard/PayoutRequestModal';
import { RevenueChart } from '@/components/dashboard/Charts';
import { useDealerEarnings } from '@/lib/hooks/usePayout';
import {
  TrendingUp, Package, ShoppingCart, Star, Plus, Truck,
  CheckCircle, Clock, RotateCcw, ArrowRight, AlertCircle,
  Wallet, Inbox, PlusCircle,
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useDealerSellRequests } from '@/lib/hooks/useSellRequests';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

// ── Son N ayın gelir verisi (orders state'inden hesaplanır) ─────────────────────
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function buildMonthlyChartData(orders: any[], numMonths = 8) {
  const now = new Date();
  return Array.from({ length: numMonths }, (_, i) => {
    const d     = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1 - i), 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const label = `${TR_MONTHS[month]}${year !== now.getFullYear() ? ` ${year}` : ''}`;

    const monthOrders = orders.filter((o) => {
      const od = new Date(o.createdAt);
      return (
        od.getFullYear() === year &&
        od.getMonth()    === month &&
        (o.paymentStatus === 'RELEASED' || o.paymentStatus === 'ESCROW')
      );
    });

    const ciro = monthOrders.reduce((s, o) => s + Number(o.amount ?? 0), 0);
    // Her siparişin kendi komisyon oranı düşülmüş net kâr (sabit %5 değil)
    const kar  = Math.round(
      monthOrders.reduce((s, o) => s + Number(o.amount ?? 0) * (1 - Number(o.commissionRate ?? 0.05)), 0)
    );

    return { month: label, ciro, kar };
  });
}

const CONDITION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  'A+': { label: 'Tertemiz',  color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  'A':  { label: 'Çok İyi',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  'B':  { label: 'İyi',       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'C':  { label: 'Kabul Edilebilir',color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
};

const ORDER_STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  ESCROW:    { label: 'Ödeme Bekliyor', color: '#f59e0b', bg: 'rgba(245,158,11,0.09)',  border: 'rgba(245,158,11,0.2)',  icon: <Clock size={11}/>         },
  RELEASED:  { label: 'Tamamlandı',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.09)',  border: 'rgba(139,92,246,0.2)', icon: <CheckCircle size={11}/>   },
  REFUNDED:  { label: 'İade',           color: '#ef4444', bg: 'rgba(239,68,68,0.09)',   border: 'rgba(239,68,68,0.2)',  icon: <RotateCcw size={11}/>     },
};

export default function DealerDashboard() {
  const [stocks, setStocks]       = useState<any[]>([]);
  const [orders, setOrders]       = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [toast, setToast]         = useState('');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const { user } = useApp();
  const { data: sellRequests } = useDealerSellRequests();
  const { data: earnings } = useDealerEarnings();
  const walletBalance = Number((user as any)?.walletBalance ?? 0);
  const openRequests  = (sellRequests ?? []).filter(r => r.status === 'PENDING').length;
  const myBidCount    = (sellRequests ?? []).filter(r => !!(r as any).myBid).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [stockRes, orderRes] = await Promise.all([
        apiClient.get('/catalog/stock/my').catch(() => ({ data: [] })),
        apiClient.get('/orders/dealer').catch(() => ({ data: [] })),
      ]);
      setStocks(stockRes.data);
      setOrders(orderRes.data);
    } catch {
      showToast('Veriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Özet metrikler
  const activeStock   = stocks.filter((s) => s.stock > 0).length;
  const totalRevenue  = orders.reduce((sum, o) => sum + Number(o.amount ?? 0), 0);
  // Her siparişin kendi komisyon oranı düşülmüş net kazanç (sabit %5 değil)
  const netRevenue    = orders.reduce((sum, o) => sum + Number(o.amount ?? 0) * (1 - Number(o.commissionRate ?? 0.05)), 0);

  // Son 30 gün sipariş
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thirtyDaysAgo
  ).length;

  return (
    <div className="flex flex-col gap-7 relative pb-10">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-2xl bg-violet-500/15 border border-violet-500/35 text-violet-400 text-sm font-semibold backdrop-blur-xl shadow-xl animate-slide-up">
          {toast}
        </div>
      )}

      {/* Başlık */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-50 text-[22px] font-bold tracking-tight">
            Satış Merkezi
          </h2>
          <p className="text-zinc-500 text-[13px] mt-0.5">
            Gerçek zamanlı stok ve sipariş özeti
          </p>
        </div>
        <Link
          href="/dealer/products"
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:-translate-y-0.5"
        >
          <Plus size={15} /> Ürün Ekle
        </Link>
      </div>

      {/* ── Bakiye + Hızlı Erişim ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {/* Cüzdan */}
        <div style={{ background: walletBalance > 0 ? 'rgba(139,92,246,0.07)' : 'rgba(245,158,11,0.07)', borderRadius: 16, border: walletBalance > 0 ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(245,158,11,0.2)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: walletBalance > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet size={18} style={{ color: walletBalance > 0 ? '#8B5CF6' : '#f59e0b' }} />
          </div>
          <div>
            <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Bakiyem</p>
            <p style={{ color: walletBalance > 0 ? '#8B5CF6' : '#f59e0b', fontSize: '20px', fontWeight: 800, margin: '2px 0 0', fontFamily: 'monospace' }}>{fmt(walletBalance)}</p>
            {walletBalance === 0 && <p style={{ color: 'rgba(245,158,11,0.6)', fontSize: '10px', margin: 0 }}>Teklif için bakiye yükle</p>}
          </div>
        </div>
        {/* Açık Talepler */}
        <Link href="/dealer/buy-requests" style={{ textDecoration: 'none' }}>
          <div style={{ background: openRequests > 0 ? 'rgba(14,165,233,0.07)' : 'rgba(255,255,255,0.03)', borderRadius: 16, border: openRequests > 0 ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(255,255,255,0.07)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(14,165,233,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
              <Inbox size={18} style={{ color: '#0ea5e9' }} />
              {openRequests > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{openRequests}</span>}
            </div>
            <div>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Pazaryeri</p>
              <p style={{ color: '#0ea5e9', fontSize: '20px', fontWeight: 800, margin: '2px 0 0' }}>{openRequests}</p>
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', margin: 0 }}>açık talep, {myBidCount} teklifim</p>
            </div>
          </div>
        </Link>
        {/* Cihaz Sat */}
        <Link href="/dealer/sell" style={{ textDecoration: 'none' }}>
          <div style={{ background: 'rgba(139,92,246,0.05)', borderRadius: 16, border: '1px solid rgba(139,92,246,0.15)', padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <PlusCircle size={18} style={{ color: '#8B5CF6' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>Cihaz Sat</p>
              <p style={{ color: '#8B5CF6', fontSize: '14px', fontWeight: 700, margin: '4px 0 0' }}>Yeni İlan →</p>
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', margin: 0 }}>bayilere sat</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Metrik kartlar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Net Kazanç" value={loading ? '…' : fmt(netRevenue)}
          accent="#00D084" icon={<TrendingUp size={17}/>} large
          subtitle="komisyon düşülmüş"
        />
        <MetricCard
          title="Toplam Satış" value={loading ? '…' : fmt(totalRevenue)}
          accent="#0ea5e9" icon={<Star size={17}/>} large
          subtitle="tüm zamanlar"
        />
        <MetricCard
          title="Aktif İlan" value={loading ? '…' : activeStock.toString()}
          accent="#a855f7" icon={<Package size={17}/>}
          subtitle="stokta var"
        />
        <MetricCard
          title="Bu Ay Sipariş" value={loading ? '…' : recentOrders.toString()}
          accent="#f59e0b" icon={<ShoppingCart size={17}/>}
          subtitle="son 30 gün"
        />
      </div>

      {/* Escrow kartı */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RevenueChart data={buildMonthlyChartData(orders)} />
        </div>
        <EscrowCard
          pending={earnings?.escrowPending ?? 0}
          withdrawable={earnings?.withdrawable ?? 0}
          lastPayout={earnings?.lastPayoutAmount ?? 0}
          lastPayoutDate={
            earnings?.lastPayoutDate
              ? new Date(earnings.lastPayoutDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
              : '-'
          }
          onWithdraw={() => {
            if (!earnings?.withdrawable) {
              showToast('Şu anda çekilebilir bakiyeniz yok.');
              return;
            }
            setShowPayoutModal(true);
          }}
        />
      </div>

      {showPayoutModal && earnings && (
        <PayoutRequestModal
          withdrawable={earnings.withdrawable}
          defaultIban={earnings.iban}
          defaultIbanName={earnings.ibanName}
          onClose={() => setShowPayoutModal(false)}
        />
      )}

      {/* ── Stok Özeti ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-zinc-50 text-[16px] font-bold">Stoklarım</h3>
            <p className="text-zinc-500 text-[12px] mt-0.5">
              {stocks.length} kayıt — tam yönetim için İlanlarım sayfasına gidin
            </p>
          </div>
          <Link
            href="/dealer/products"
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-[13px] font-semibold transition-colors"
          >
            Tümünü Yönet <ArrowRight size={14}/>
          </Link>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-zinc-500 text-sm">Yükleniyor…</div>
          ) : stocks.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle size={28} className="text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">Henüz ürün eklemediniz</p>
              <p className="text-zinc-400 text-xs mt-1">
                İlk ürününüzü eklemek için yukarıdaki <strong className="text-zinc-400">Ürün Ekle</strong> butonuna tıklayın.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Model', 'Durum', 'Fiyat', 'Stok'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stocks.slice(0, 8).map((s) => {
                  const cond = CONDITION_LABELS[s.grade] ?? { label: s.grade, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
                  return (
                    <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-zinc-100 text-[14px] font-bold">
                          {s.globalProduct?.brand} {s.globalProduct?.model}
                        </div>
                        <div className="text-zinc-500 text-[11px] mt-0.5">
                          {s.globalProduct?.storage}{s.batteryHealth ? ` · Pil %${s.batteryHealth}` : ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                          style={{ color: cond.color, background: cond.bg }}>
                          {cond.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-violet-400 font-bold text-[14px]">
                        {fmt(Number(s.price))}
                      </td>
                      <td className="px-5 py-4 text-zinc-400 text-[13px]">
                        {s.stock} adet
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Son Siparişler ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-zinc-50 text-[16px] font-bold">Son Siparişler</h3>
            <p className="text-zinc-500 text-[12px] mt-0.5">
              Müşteri kimliği gizlidir — anonim sipariş sistemi
            </p>
          </div>
          <Link
            href="/dealer/orders"
            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-[13px] font-semibold transition-colors"
          >
            Tümünü Gör <ArrowRight size={14}/>
          </Link>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-zinc-500 text-sm">Yükleniyor…</div>
          ) : orders.length === 0 ? (
            <div className="p-10 text-center">
              <ShoppingCart size={28} className="text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm font-semibold">Henüz sipariş yok</p>
              <p className="text-zinc-400 text-xs mt-1">
                Stok ekleyip aktifleştirdiğinizde siparişler burada görünecek.
              </p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['Ürün', 'Tutar', 'Durum', 'Tarih'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-zinc-500 text-[11px] font-bold uppercase tracking-widest">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o, i) => {
                  const cfg = ORDER_STATUS[o.paymentStatus] ?? ORDER_STATUS.ESCROW;
                  return (
                    <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-zinc-100 text-[13px] font-semibold">
                          {o.product
                            ? `${o.product.brand ?? ''} ${o.product.model ?? ''}`.trim() || 'Ürün'
                            : o.dealerStock?.globalProduct
                              ? `${o.dealerStock.globalProduct.brand ?? ''} ${o.dealerStock.globalProduct.model ?? ''}`.trim() || 'Ürün'
                              : 'Ürün bilgisi yok'}
                        </div>
                        <div className="text-zinc-500 text-[11px] font-mono mt-0.5">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-violet-400 font-bold text-[14px]">
                        {fmt(Number(o.amount))}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-zinc-500 text-[12px]">
                        {new Date(o.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
