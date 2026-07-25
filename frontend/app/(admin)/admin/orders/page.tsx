'use client';
import { useState, useEffect, useMemo } from 'react';
import apiClient from '@/lib/api';
import {
  ShoppingCart, CheckCircle, Clock, XCircle, RotateCcw,
  RefreshCw, Search, Truck, Warehouse, ClipboardCheck,
  PackageCheck, Send,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

function productName(order: any): string {
  if (order.product?.brand || order.product?.model) {
    return `${order.product.brand ?? ''} ${order.product.model ?? ''}`.trim() || 'Ürün';
  }
  if (order.dealerStock?.globalProduct) {
    const gp = order.dealerStock.globalProduct;
    return `${gp.brand ?? ''} ${gp.model ?? ''}${gp.storage ? ` ${gp.storage}` : ''}`.trim() || 'Ürün';
  }
  return 'Ürün bilgisi yok';
}

// ── Ödeme durumu ──────────────────────────────────────────────────────────────
const PAY_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Beklemede',  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', icon: <Clock size={11}/>         },
  ESCROW:    { label: 'Escrow',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  icon: <ShoppingCart size={11}/>   },
  RELEASED:  { label: 'Tamamlandı', color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)', icon: <CheckCircle size={11}/>    },
  REFUNDED:  { label: 'İade',       color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  icon: <RotateCcw size={11}/>      },
  CANCELLED: { label: 'İptal',      color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)',icon: <XCircle size={11}/>        },
};

// ── Kargo durumu ──────────────────────────────────────────────────────────────
const SHIP_CFG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  WAITING_DEALER_SHIPMENT: { label: 'Kargo Bekleniyor',    color: '#f59e0b', icon: <Clock size={11}/>           },
  DEALER_SHIPPED:          { label: 'Bayiden Geldi',       color: '#0ea5e9', icon: <Truck size={11}/>           },
  WAREHOUSE_RECEIVED:      { label: 'Merkezde',            color: '#F97316', icon: <Warehouse size={11}/>       },
  INSPECTION_PASSED:       { label: 'Denetim OK',          color: '#06b6d4', icon: <ClipboardCheck size={11}/> },
  ADMIN_SHIPPED:           { label: 'Müşteriye Gönderildi',color: '#F97316', icon: <Truck size={11}/>           },
  DELIVERED:               { label: 'Teslim Edildi',       color: '#F97316', icon: <PackageCheck size={11}/>    },
};

const ALL_STATUSES = ['ALL', 'PENDING', 'ESCROW', 'RELEASED', 'REFUNDED', 'CANCELLED'];

// ── Ödeme geçiş seçenekleri ───────────────────────────────────────────────────
function payTransitions(status: string): { value: string; label: string }[] {
  switch (status) {
    case 'PENDING':  return [{ value: 'ESCROW', label: 'Escrow\'ya Al' }, { value: 'CANCELLED', label: 'İptal Et' }];
    case 'ESCROW':   return [{ value: 'RELEASED', label: 'Escrow Serbest' }, { value: 'REFUNDED', label: 'İade Et' }];
    case 'RELEASED': return [{ value: 'REFUNDED', label: 'İade Et' }];
    default:         return [];
  }
}

// ── Kargo akış butonları ──────────────────────────────────────────────────────
function shippingActions(order: any): { endpoint: string; label: string; color: string; needsInput?: 'trackingCode' | 'notes' }[] {
  if (order.paymentStatus !== 'ESCROW') return [];
  switch (order.shippingStatus) {
    case 'DEALER_SHIPPED':    return [{ endpoint: `/orders/${order.id}/warehouse-receive`, label: 'Merkeze Teslim Al', color: '#F97316' }];
    case 'WAREHOUSE_RECEIVED':return [{ endpoint: `/orders/${order.id}/inspection-pass`,  label: 'Denetim Geçti',     color: '#06b6d4', needsInput: 'notes' }];
    case 'INSPECTION_PASSED': return [{ endpoint: `/orders/${order.id}/admin-ship`,        label: 'Müşteriye Kargola', color: '#F97316', needsInput: 'trackingCode' }];
    case 'ADMIN_SHIPPED':     return [{ endpoint: `/orders/${order.id}/delivered`,         label: 'Teslim Onayı + Escrow Serbest', color: '#F97316' }];
    default:                  return [];
  }
}

// ── Kargo akış paneli ─────────────────────────────────────────────────────────
function ShippingPanel({ order, onDone }: { order: any; onDone: (msg: string) => void }) {
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);

  const actions = shippingActions(order);
  if (actions.length === 0) return null;

  const act = actions[0];

  const run = async () => {
    setLoading(true);
    try {
      const body: any = {};
      if (act.needsInput === 'trackingCode') body.trackingCode = input;
      if (act.needsInput === 'notes')        body.notes = input;
      await apiClient.patch(act.endpoint, body);
      onDone(`✅ ${act.label} tamamlandı`);
    } catch (e: any) {
      onDone(`❌ ${e?.response?.data?.message ?? 'Hata oluştu'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '12px', borderRadius: '10px', background: `${act.color}08`, border: `1px solid ${act.color}22`, marginTop: '8px' }}>
      <p style={{ color: act.color, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        📦 Sonraki Adım
      </p>
      {act.needsInput && (
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={act.needsInput === 'trackingCode' ? 'Kargo takip kodu…' : 'Denetim notu (opsiyonel)…'}
          style={{
            width: '100%', padding: '8px 10px', borderRadius: '8px', marginBottom: '8px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc', fontSize: '12px', outline: 'none', boxSizing: 'border-box',
          }}
        />
      )}
      <button
        disabled={loading || (!!act.needsInput && act.needsInput === 'trackingCode' && !input.trim())}
        onClick={run}
        style={{
          width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
          background: act.color, color: 'white', fontSize: '12px', fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          opacity: loading ? 0.6 : 1,
        }}>
        <Send size={12}/> {loading ? 'İşleniyor…' : act.label}
      </button>
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────
export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('ALL');
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast]       = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = () => {
    setLoading(true);
    apiClient.get('/admin/orders')
      .then(r => { setOrders(r.data); })
      .catch(() => showToast('Siparişler yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Seçili siparişi taze veriyle güncelle
  const refreshSelected = (id: string) => {
    apiClient.get('/admin/orders').then(r => {
      setOrders(r.data);
      const fresh = r.data.find((o: any) => o.id === id);
      if (fresh) setSelected(fresh);
    });
  };

  const visible = useMemo(() => {
    let list = orders;
    if (filter !== 'ALL') list = list.filter(o => o.paymentStatus === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        productName(o).toLowerCase().includes(q) ||
        (o.buyer?.name ?? '').toLowerCase().includes(q) ||
        (o.seller?.companyName ?? '').toLowerCase().includes(q) ||
        (o.seller?.name ?? '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [orders, filter, search]);

  const stats = useMemo(() => ({
    total:     orders.length,
    escrow:    orders.filter(o => o.paymentStatus === 'ESCROW').length,
    released:  orders.filter(o => o.paymentStatus === 'RELEASED').length,
    refunded:  orders.filter(o => o.paymentStatus === 'REFUNDED').length,
    cancelled: orders.filter(o => o.paymentStatus === 'CANCELLED').length,
    gmv: orders.filter(o => ['RELEASED', 'ESCROW'].includes(o.paymentStatus))
               .reduce((s, o) => s + Number(o.amount ?? 0), 0),
  }), [orders]);

  const updatePayStatus = async (orderId: string, paymentStatus: string) => {
    setUpdating(true);
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { paymentStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus } : o));
      if (selected?.id === orderId) setSelected((p: any) => ({ ...p, paymentStatus }));
      showToast(`Durum → ${PAY_CFG[paymentStatus]?.label ?? paymentStatus}`);
    } catch {
      showToast('Güncelleme başarısız');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '12px',
          background: toast.startsWith('❌') ? 'rgba(239,68,68,0.15)' : 'rgba(249,115,22,0.15)',
          border: toast.startsWith('❌') ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(249,115,22,0.35)',
          color: toast.startsWith('❌') ? '#ef4444' : '#F97316',
          fontSize: '13px', fontWeight: 700,
          backdropFilter: 'blur(16px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div>
        <h2 style={{ color: '#f8fafc', fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Sipariş Yönetimi
        </h2>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px' }}>
          Ödeme durumu ve kargo akışını yönet
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px' }}>
        {[
          { label: 'Toplam',     value: stats.total,     color: '#94a3b8' },
          { label: 'Escrow',     value: stats.escrow,    color: '#f59e0b' },
          { label: 'Tamamlandı', value: stats.released,  color: '#F97316' },
          { label: 'İade',       value: stats.refunded,  color: '#ef4444' },
          { label: 'İptal',      value: stats.cancelled, color: '#6b7280' },
          { label: 'GMV', value: fmt(stats.gmv), color: '#0ea5e9', isStr: true },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px 18px', borderRadius: '12px', background: `${s.color}08`, border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: (s as any).isStr ? '14px' : '24px', fontWeight: 800, color: s.color }}>{loading ? '…' : s.value}</div>
            <div style={{ color: 'rgba(248,250,252,0.35)', fontSize: '11px', marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,250,252,0.3)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Sipariş ID, ürün, alıcı veya bayi ara…"
            style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {ALL_STATUSES.map(s => {
            const active = filter === s;
            const cfg = PAY_CFG[s];
            return (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: active ? (cfg ? cfg.bg : 'rgba(255,255,255,0.1)') : 'transparent', color: active ? (cfg ? cfg.color : '#f8fafc') : 'rgba(248,250,252,0.4)', transition: 'all 0.15s' }}>
                {s === 'ALL' ? 'Tümü' : cfg?.label ?? s}
              </button>
            );
          })}
        </div>
        <button onClick={load} disabled={loading} style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.6)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Yenile
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '20px', alignItems: 'start' }}>

        {/* Table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Sipariş', 'Ürün', 'Alıcı', 'Bayi', 'Tutar', 'Ödeme', 'Kargo', 'Tarih'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'rgba(248,250,252,0.3)', fontSize: '13px' }}>Yükleniyor…</td></tr>
              ) : visible.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: 'rgba(248,250,252,0.3)', fontSize: '13px' }}>{search || filter !== 'ALL' ? 'Filtrelerle eşleşen sipariş bulunamadı.' : 'Henüz sipariş yok.'}</td></tr>
              ) : visible.map((o, i) => {
                const pay  = PAY_CFG[o.paymentStatus] ?? PAY_CFG.PENDING;
                const ship = o.shippingStatus ? SHIP_CFG[o.shippingStatus] : null;
                const isSelected = selected?.id === o.id;
                // Kargo akışında işlem bekleyen sipariş mi?
                const needsAction = shippingActions(o).length > 0;

                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(isSelected ? null : o)}
                    style={{ borderBottom: i < visible.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', background: isSelected ? 'rgba(255,255,255,0.04)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? 'rgba(255,255,255,0.04)' : 'transparent'; }}
                  >
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {needsAction && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} title="İşlem bekliyor"/>}
                        <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 700, fontFamily: 'monospace' }}>
                          #{o.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: '160px' }}>
                      <div style={{ color: 'rgba(248,250,252,0.8)', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{productName(o)}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(248,250,252,0.6)', fontSize: '12px', whiteSpace: 'nowrap' }}>{o.buyer?.name ?? '—'}</td>
                    <td style={{ padding: '14px 16px', maxWidth: '120px' }}>
                      <div style={{ color: 'rgba(248,250,252,0.6)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.seller?.companyName ?? o.seller?.name ?? '—'}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#F97316', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(Number(o.amount))}</td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 700, background: pay.bg, color: pay.color, border: `1px solid ${pay.border}` }}>
                        {pay.icon} {pay.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      {ship ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: ship.color }}>
                          {ship.icon} {ship.label}
                        </span>
                      ) : <span style={{ color: 'rgba(248,250,252,0.2)', fontSize: '11px' }}>—</span>}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'rgba(248,250,252,0.35)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(o.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {visible.length > 0 && (
            <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.04)', color: 'rgba(248,250,252,0.3)', fontSize: '12px' }}>
              {visible.length} sipariş{orders.length !== visible.length ? ` / ${orders.length} toplam` : ''}
              {orders.filter(o => shippingActions(o).length > 0).length > 0 && (
                <span style={{ marginLeft: '12px', color: '#f59e0b', fontWeight: 700 }}>
                  ● {orders.filter(o => shippingActions(o).length > 0).length} sipariş işlem bekliyor
                </span>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '22px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <h3 style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 800, fontFamily: 'monospace' }}>#{selected.id.slice(0, 8).toUpperCase()}</h3>
                <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', marginTop: '2px' }}>{new Date(selected.createdAt).toLocaleString('tr-TR')}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'rgba(248,250,252,0.4)', cursor: 'pointer', fontSize: '20px', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

              {/* Ürün */}
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Ürün</p>
                <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600 }}>{productName(selected)}</p>
                {selected.dealerStock?.grade && <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', marginTop: '2px' }}>Kalite: {selected.dealerStock.grade}</p>}
              </div>

              {/* Tutar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Tutar</p>
                  <p style={{ color: '#F97316', fontSize: '15px', fontWeight: 800 }}>{fmt(Number(selected.amount))}</p>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Platform</p>
                  <p style={{ color: '#f59e0b', fontSize: '15px', fontWeight: 800 }}>{fmt(Number(selected.amount) * 0.05)}</p>
                </div>
              </div>

              {/* Taraflar */}
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Taraflar</p>
                {[
                  { k: 'Alıcı', v: selected.buyer?.name ?? '—' },
                  { k: 'Bayi',  v: selected.seller?.companyName ?? selected.seller?.name ?? '—' },
                  { k: 'Adet',  v: selected.quantity },
                ].map(({ k, v }) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px' }}>{k}</span>
                    <span style={{ color: 'rgba(248,250,252,0.8)', fontSize: '12px', fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Kargo bilgileri */}
              {(selected.dealerTrackingCode || selected.adminTrackingCode || selected.shippingAddress) && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Kargo</p>
                  {selected.dealerTrackingCode && (
                    <div style={{ marginBottom: '5px' }}>
                      <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px' }}>Bayi kargo: </span>
                      <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{selected.dealerTrackingCode}</span>
                    </div>
                  )}
                  {selected.adminTrackingCode && (
                    <div style={{ marginBottom: '5px' }}>
                      <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px' }}>Müşteri kargo: </span>
                      <span style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 600, fontFamily: 'monospace' }}>{selected.adminTrackingCode}</span>
                    </div>
                  )}
                  {selected.shippingAddress && (
                    <div style={{ marginTop: '6px', color: 'rgba(248,250,252,0.5)', fontSize: '12px' }}>{selected.shippingAddress}</div>
                  )}
                </div>
              )}

              {/* Kargo akış adımları */}
              {selected.shippingStatus && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Kargo Akışı</p>
                  {Object.keys(SHIP_CFG).map(key => {
                    const statuses = Object.keys(SHIP_CFG);
                    const currentIdx = statuses.indexOf(selected.shippingStatus);
                    const keyIdx = statuses.indexOf(key);
                    const done   = keyIdx < currentIdx;
                    const active = keyIdx === currentIdx;
                    const cfg = SHIP_CFG[key];
                    return (
                      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', opacity: done || active ? 1 : 0.3 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(249,115,22,0.2)' : active ? `${cfg.color}25` : 'rgba(255,255,255,0.05)', border: done ? '1px solid rgba(249,115,22,0.4)' : active ? `1px solid ${cfg.color}50` : '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                          {done ? <CheckCircle size={9} color="#F97316"/> : cfg.icon}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: active ? 700 : 500, color: active ? cfg.color : done ? '#F97316' : 'rgba(248,250,252,0.4)' }}>{cfg.label}</span>
                      </div>
                    );
                  })}

                  {/* Kargo akış butonu */}
                  <ShippingPanel
                    order={selected}
                    onDone={msg => {
                      showToast(msg);
                      refreshSelected(selected.id);
                    }}
                  />
                </div>
              )}

              {/* Ödeme durumu değiştir */}
              {payTransitions(selected.paymentStatus).length > 0 && (
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Ödeme Durumu</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {payTransitions(selected.paymentStatus).map(t => {
                      const cfg = PAY_CFG[t.value];
                      return (
                        <button key={t.value} disabled={updating} onClick={() => updatePayStatus(selected.id, t.value)} style={{ padding: '9px 14px', borderRadius: '9px', border: `1px solid ${cfg?.border ?? 'rgba(255,255,255,0.15)'}`, background: cfg?.bg ?? 'rgba(255,255,255,0.06)', color: cfg?.color ?? '#f8fafc', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: updating ? 0.6 : 1 }}>
                          {cfg?.icon} {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
