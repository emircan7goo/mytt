'use client';
import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api';
import {
  Search, Package, ShoppingCart, CheckCircle, Clock,
  RotateCcw, XCircle, Truck, Warehouse, ClipboardCheck,
  ChevronDown, ChevronUp, Send,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

// ── Ödeme durumu ──────────────────────────────────────────────────────────────
const PAY_STATUS: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Ödeme Bekleniyor', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', icon: <Clock size={11}/>       },
  ESCROW:    { label: 'Escrow\'da',       color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  icon: <Clock size={11}/>       },
  RELEASED:  { label: 'Tamamlandı',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.25)', icon: <CheckCircle size={11}/> },
  REFUNDED:  { label: 'İade Edildi',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: <RotateCcw size={11}/>   },
  CANCELLED: { label: 'İptal',            color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)',icon: <XCircle size={11}/>     },
};

// ── Kargo durumu ──────────────────────────────────────────────────────────────
const SHIP_STATUS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  WAITING_DEALER_SHIPMENT: { label: 'Kargo Bekleniyor',    color: '#f59e0b', icon: <Package size={11}/>         },
  DEALER_SHIPPED:          { label: 'Merkeze Gönderildi',  color: '#0ea5e9', icon: <Truck size={11}/>            },
  WAREHOUSE_RECEIVED:      { label: 'Merkeze Ulaştı',      color: '#8b5cf6', icon: <Warehouse size={11}/>        },
  INSPECTION_PASSED:       { label: 'Denetim Geçti',       color: '#06b6d4', icon: <ClipboardCheck size={11}/>   },
  ADMIN_SHIPPED:           { label: 'Müşteriye Gönderildi',color: '#8B5CF6', icon: <Truck size={11}/>            },
  DELIVERED:               { label: 'Teslim Edildi',       color: '#8B5CF6', icon: <CheckCircle size={11}/>      },
};

// ── Ürün adı yardımcısı ───────────────────────────────────────────────────────
function productLabel(order: any): string {
  if (order.product?.brand || order.product?.model) {
    return `${order.product.brand ?? ''} ${order.product.model ?? ''}`.trim() || 'Ürün';
  }
  if (order.dealerStock?.globalProduct) {
    const gp = order.dealerStock.globalProduct;
    return `${gp.brand ?? ''} ${gp.model ?? ''}${gp.storage ? ` ${gp.storage}` : ''}`.trim() || 'Ürün';
  }
  return 'Ürün bilgisi yok';
}

// ── Kargo Kodu Giriş Formu ────────────────────────────────────────────────────
function ShipForm({ orderId, onSuccess }: { orderId: string; onSuccess: () => void }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.patch(`/orders/${orderId}/dealer-ship`, { trackingCode: code.trim() });
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Kargo kodu gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
      <p className="text-amber-400 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
        <Truck size={12}/> Merkeze Kargo Kodu Gir
      </p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Örn: 9342082348971"
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          required
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? '…' : <><Send size={13}/> Gönder</>}
        </button>
      </div>
      {error && <p className="text-red-400 text-[11px]">{error}</p>}
    </form>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function DealerOrdersPage() {
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = () => {
    setLoading(true);
    apiClient.get('/orders/dealer')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return orders;
    return orders.filter(o =>
      o.id?.toLowerCase().includes(q) ||
      productLabel(o).toLowerCase().includes(q),
    );
  }, [orders, search]);

  // Özet sayılar
  const stats = useMemo(() => ({
    escrow:   orders.filter(o => o.paymentStatus === 'ESCROW').length,
    released: orders.filter(o => o.paymentStatus === 'RELEASED').length,
    pending:  orders.filter(o => o.shippingStatus === 'WAITING_DEALER_SHIPMENT' && o.paymentStatus === 'ESCROW').length,
  }), [orders]);

  return (
    <div className="flex flex-col gap-6 pb-12 relative">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] px-5 py-3 rounded-2xl bg-violet-500/15 border border-violet-500/35 text-violet-400 text-sm font-semibold backdrop-blur-xl shadow-xl">
          {toast}
        </div>
      )}

      {/* Başlık */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-zinc-50 text-2xl font-bold tracking-tight">Sipariş Yönetimi</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Müşteri kimliği gizlidir — anonim sipariş sistemi
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={15}/>
          <input
            type="text"
            placeholder="Ürün veya sipariş ara…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500/40 transition-all"
          />
        </div>
      </div>

      {/* Özet kartlar */}
      {orders.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Kargo Bekliyor', value: stats.pending,  color: '#f59e0b', desc: 'escrow + gönderilmedi' },
            { label: 'Escrow\'da',     value: stats.escrow,   color: '#0ea5e9', desc: 'ödeme tutuldu' },
            { label: 'Tamamlandı',    value: stats.released, color: '#8B5CF6', desc: 'escrow serbest' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-4"
              style={{ background: `${s.color}08`, borderColor: `${s.color}22` }}>
              <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
              <div className="text-zinc-300 text-[12px] font-semibold mt-0.5">{s.label}</div>
              <div className="text-zinc-400 text-[10px] mt-0.5">{s.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tablo */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-800">
              {['Sipariş', 'Ürün', 'Tutar', 'Ödeme Durumu', 'Kargo Durumu', 'Tarih', ''].map(h => (
                <th key={h} className="px-5 py-3.5 text-zinc-500 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-zinc-500 text-sm">Yükleniyor…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center">
                  <ShoppingCart size={28} className="text-zinc-500 mx-auto mb-3"/>
                  <p className="text-zinc-500 text-sm font-medium">
                    {search ? 'Arama ile eşleşen sipariş bulunamadı' : 'Henüz sipariş gelmedi'}
                  </p>
                </td>
              </tr>
            ) : filtered.map(o => {
              const pay  = PAY_STATUS[o.paymentStatus] ?? PAY_STATUS.PENDING;
              const ship = o.shippingStatus ? (SHIP_STATUS[o.shippingStatus] ?? null) : null;
              const isExpanded = expanded === o.id;
              // Kargo kodu girilebilir mi?
              const canShip = o.paymentStatus === 'ESCROW' &&
                              o.shippingStatus === 'WAITING_DEALER_SHIPMENT';

              return (
                <>
                  <tr
                    key={o.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : o.id)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-800/60 rounded-lg flex-shrink-0">
                          <Package size={14} className="text-zinc-400"/>
                        </div>
                        <span className="text-zinc-100 font-mono text-[12px] font-bold tracking-widest">
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-zinc-200 text-[13px] font-semibold">{productLabel(o)}</div>
                      <div className="text-zinc-500 text-[11px] mt-0.5">{o.quantity} adet</div>
                    </td>
                    <td className="px-5 py-4 text-violet-400 font-black text-[14px]">
                      {fmt(Number(o.amount))}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ color: pay.color, background: pay.bg, border: `1px solid ${pay.border}` }}>
                        {pay.icon} {pay.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {ship ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
                          style={{ color: ship.color }}>
                          {ship.icon} {ship.label}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-zinc-500 text-[12px] whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {canShip && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold">
                            <Truck size={10}/> Kargo Gir
                          </span>
                        )}
                        {isExpanded ? <ChevronUp size={14} className="text-zinc-500"/> : <ChevronDown size={14} className="text-zinc-500"/>}
                      </div>
                    </td>
                  </tr>

                  {/* Detay satırı */}
                  {isExpanded && (
                    <tr key={`${o.id}-detail`} className="border-b border-zinc-800/30 bg-zinc-900/30">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="flex flex-col gap-3">

                          {/* Kargo akış adımları */}
                          {o.shippingStatus && (
                            <div className="flex items-center gap-1 flex-wrap">
                              {[
                                { key: 'WAITING_DEALER_SHIPMENT', label: 'Hazır'      },
                                { key: 'DEALER_SHIPPED',          label: 'Gönderildi' },
                                { key: 'WAREHOUSE_RECEIVED',      label: 'Merkezde'   },
                                { key: 'INSPECTION_PASSED',       label: 'Onaylı'     },
                                { key: 'ADMIN_SHIPPED',           label: 'Yolda'      },
                                { key: 'DELIVERED',               label: 'Teslim'     },
                              ].map((step, idx, arr) => {
                                const statuses = Object.keys(SHIP_STATUS);
                                const currentIdx = statuses.indexOf(o.shippingStatus);
                                const stepIdx    = statuses.indexOf(step.key);
                                const done = stepIdx < currentIdx;
                                const active = stepIdx === currentIdx;
                                return (
                                  <div key={step.key} className="flex items-center gap-1">
                                    <div className={active ? 'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all bg-sky-500/20 border border-sky-500/40 text-sky-400' : done ? 'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all bg-violet-500/15 border border-violet-500/25 text-violet-400' : 'px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all bg-zinc-800/40 border border-zinc-700/30 text-zinc-400'}>
                                      {done ? '✓ ' : ''}{step.label}
                                    </div>
                                    {idx < arr.length - 1 && (
                                      <div className={`w-4 h-px ${done ? 'bg-violet-500/40' : 'bg-zinc-700/40'}`}/>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Kargo kodları */}
                          <div className="flex flex-wrap gap-4">
                            {o.dealerTrackingCode && (
                              <div>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Bayi Kargo Kodu</p>
                                <p className="text-zinc-300 text-[13px] font-mono">{o.dealerTrackingCode}</p>
                              </div>
                            )}
                            {o.adminTrackingCode && (
                              <div>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Müşteri Kargo Kodu</p>
                                <p className="text-zinc-300 text-[13px] font-mono">{o.adminTrackingCode}</p>
                              </div>
                            )}
                            {o.shippingAddress && (
                              <div>
                                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mb-1">Teslimat Adresi</p>
                                <p className="text-zinc-400 text-[12px]">{o.shippingAddress}</p>
                              </div>
                            )}
                          </div>

                          {/* Kargo kodu giriş formu — sadece gerektiğinde */}
                          {canShip && (
                            <ShipForm
                              orderId={o.id}
                              onSuccess={() => {
                                showToast('Kargo kodu kaydedildi!');
                                load();
                              }}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
