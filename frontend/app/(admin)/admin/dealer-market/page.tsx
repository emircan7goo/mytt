'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Clock, CheckCircle, XCircle, Loader2, Eye, Gavel, Tag,
  ArrowRight, Building2, Package, Shield, RefreshCw,
} from 'lucide-react';
import { useAdminDealerMarket, useAdminApproveDealerMarket, useAdminRejectDealerMarket } from '@/lib/hooks/useDealerMarket';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import type { DealerMarketItem } from '@/lib/hooks/useDealerMarket';
import apiClient from '@/lib/api';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_ADMIN: { label: 'Onay Bekliyor',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  ACTIVE:        { label: 'Aktif',           color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)' },
  EXPIRED:       { label: 'Süre Doldu',      color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  SOLD:          { label: 'Satıldı',         color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  CANCELLED:     { label: 'İptal',           color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  REJECTED:      { label: 'Reddedildi',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

// Detail modal for a single item
function DetailModal({ item, onClose }: { item: DealerMarketItem; onClose: () => void }) {
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const approve = useAdminApproveDealerMarket();
  const reject = useAdminRejectDealerMarket();
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  // Fetch full detail with bids
  useState(() => {
    apiClient.get(`/dealer-market/admin/${item.id}`)
      .then(r => { setDetail(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  });

  const handleApprove = async () => {
    setBusy(true);
    try {
      await approve.mutateAsync({ id: item.id, adminNote: note || undefined });
      toast.success('İlan onaylandı!');
      onClose();
    } catch { toast.error('Onay başarısız'); }
    finally { setBusy(false); }
  };

  const handleReject = async () => {
    setBusy(true);
    try {
      await reject.mutateAsync({ id: item.id, adminNote: note || 'Admin tarafından reddedildi.' });
      toast.success('İlan reddedildi.');
      onClose();
    } catch { toast.error('Red başarısız'); }
    finally { setBusy(false); }
  };

  const d = detail ?? item;
  const bids = d.bids ?? [];
  const status = STATUS_MAP[d.status] ?? STATUS_MAP.PENDING_ADMIN;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0e1118', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: 700, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 24,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
            {d.images?.[0]
              ? <img src={resolveUploadUrl(d.images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={22} style={{ color: 'rgba(248,250,252,0.2)' }} /></div>}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: '#f8fafc', fontSize: 18, fontWeight: 700, margin: 0 }}>{d.brand} {d.model}</h2>
            <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 12, margin: '2px 0 0' }}>
              {[d.storage, d.color, d.grade].filter(Boolean).join(' · ')}
              {d.batteryHealth ? ` · Pil %${d.batteryHealth}` : ''}
            </p>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, color: status.color, background: status.bg }}>
            {status.label}
          </span>
        </div>

        {/* Seller */}
        <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 16 }}>
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Satan Bayi</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={14} style={{ color: '#6366f1' }} />
            <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700 }}>{d.seller?.companyName ?? d.seller?.name ?? '—'}</span>
          </div>
        </div>

        {/* Price info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Tip</p>
            <p style={{ color: d.listingType === 'AUCTION' ? '#a855f7' : '#0ea5e9', fontSize: 13, fontWeight: 800, margin: '4px 0 0' }}>
              {d.listingType === 'AUCTION' ? 'Açık Artırma' : 'Sabit Fiyat'}
            </p>
          </div>
          <div style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
              {d.listingType === 'AUCTION' ? 'Taban Fiyat' : 'Satış Fiyatı'}
            </p>
            <p style={{ color: '#8B5CF6', fontSize: 15, fontWeight: 800, margin: '4px 0 0' }}>
              {fmt(Number(d.listingType === 'AUCTION' ? d.floorPrice : d.directPrice) || 0)}
            </p>
          </div>
          <div style={{ padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>Süre</p>
            <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, margin: '4px 0 0' }}>{d.durationHours ?? 24} saat</p>
          </div>
        </div>

        {/* Bids */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Loader2 size={20} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : bids.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
              Teklifler ({bids.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {bids.sort((a: any, b: any) => Number(b.amount) - Number(a.amount)).map((bid: any, idx: number) => (
                <div key={bid.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  background: idx === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                  border: idx === 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                    background: idx === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: idx === 0 ? '#8B5CF6' : 'rgba(248,250,252,0.4)',
                    fontSize: 10, fontWeight: 800,
                  }}>#{idx + 1}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>
                      {bid.bidder?.companyName ?? bid.bidder?.name ?? 'Bayi'}
                    </span>
                    <span style={{ color: 'rgba(248,250,252,0.25)', fontSize: 10, marginLeft: 8 }}>
                      {fmtDate(bid.createdAt)}
                    </span>
                  </div>
                  <span style={{ color: idx === 0 ? '#8B5CF6' : '#f8fafc', fontSize: 15, fontWeight: 800 }}>
                    {fmt(Number(bid.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : d.status === 'PENDING_ADMIN' ? (
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 12, textAlign: 'center', padding: '16px 0', marginBottom: 16 }}>
            Onay bekleniyor — henüz teklif almadı.
          </p>
        ) : (
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 12, textAlign: 'center', padding: '16px 0', marginBottom: 16 }}>
            Henüz teklif gelmedi.
          </p>
        )}

        {/* Admin actions */}
        {d.status === 'PENDING_ADMIN' && (
          <div>
            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Admin notu (isteğe bağlı)"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8fafc', fontSize: 12, outline: 'none', boxSizing: 'border-box',
              }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleApprove} disabled={busy} style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: '#8B5CF6', border: 'none', color: '#fff', cursor: busy ? 'wait' : 'pointer',
              }}>
                {busy ? '...' : '✓ Onayla'}
              </button>
              <button onClick={handleReject} disabled={busy} style={{
                flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444',
                cursor: busy ? 'wait' : 'pointer',
              }}>
                {busy ? '...' : '✗ Reddet'}
              </button>
            </div>
          </div>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(248,250,252,0.25); }`}</style>
      </div>
    </div>
  );
}

// Main page
export default function AdminDealerMarketPage() {
  const { data: items, isLoading, refetch, isFetching } = useAdminDealerMarket();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = (items ?? []).filter(i => {
    if (filter === 'pending') return i.status === 'PENDING_ADMIN';
    if (filter === 'active') return i.status === 'ACTIVE';
    if (filter === 'closed') return ['SOLD', 'EXPIRED', 'CANCELLED', 'REJECTED'].includes(i.status);
    return true;
  });

  const counts = {
    all: (items ?? []).length,
    pending: (items ?? []).filter(i => i.status === 'PENDING_ADMIN').length,
    active: (items ?? []).filter(i => i.status === 'ACTIVE').length,
    closed: (items ?? []).filter(i => ['SOLD', 'EXPIRED', 'CANCELLED', 'REJECTED'].includes(i.status)).length,
  };

  const selectedItem = selectedId ? (items ?? []).find(i => i.id === selectedId) : null;

  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', margin: '0 0 4px' }}>
            Bayi Paslaşma İlanları
          </h1>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, margin: 0 }}>
            Bayiler arası cihaz alım-satım ilanları ve teklifler
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <RefreshCw size={13} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} /> Yenile
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[
          { key: 'all', label: 'Tümü', color: '#0ea5e9' },
          { key: 'pending', label: 'Onay Bekleyen', color: '#f59e0b' },
          { key: 'active', label: 'Aktif', color: '#8B5CF6' },
          { key: 'closed', label: 'Kapanan', color: '#6b7280' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8,
            fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
            background: filter === f.key ? `${f.color}18` : 'rgba(255,255,255,0.04)',
            border: filter === f.key ? `1px solid ${f.color}40` : '1px solid rgba(255,255,255,0.06)',
            color: filter === f.key ? f.color : 'rgba(248,250,252,0.5)',
          }}>
            {f.label}
            {(counts as any)[f.key] > 0 && (
              <span style={{ padding: '1px 6px', borderRadius: 99, fontSize: 9, fontWeight: 800, background: `${f.color}20`, color: f.color }}>
                {(counts as any)[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={28} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Package size={40} style={{ color: 'rgba(248,250,252,0.12)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 14 }}>Bu filtrede ilan bulunamadı.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Cihaz', 'Bayi', 'Tip', 'Fiyat', 'Durum', 'Tarih', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(248,250,252,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const cfg = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING_ADMIN;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setSelectedId(item.id)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                          {item.images?.[0]
                            ? <img src={resolveUploadUrl(item.images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={16} style={{ color: 'rgba(248,250,252,0.2)' }} /></div>}
                        </div>
                        <div>
                          <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, margin: 0 }}>{item.brand} {item.model}</p>
                          <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, margin: 0 }}>{item.grade} · {item.storage ?? ''}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: 600, margin: 0 }}>{item.seller?.companyName ?? item.seller?.name ?? '—'}</p>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                        color: item.listingType === 'AUCTION' ? '#a855f7' : '#0ea5e9',
                        background: item.listingType === 'AUCTION' ? 'rgba(168,85,247,0.1)' : 'rgba(14,165,233,0.1)',
                      }}>
                        {item.listingType === 'AUCTION' ? 'Açık Artırma' : 'Sabit'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#8B5CF6', fontSize: 13, fontWeight: 800 }}>
                      {fmt(Number(item.listingType === 'AUCTION' ? item.floorPrice : item.directPrice) || 0)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: 'rgba(248,250,252,0.4)', fontSize: 11 }}>
                      {fmtDate(item.createdAt)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#0ea5e9', fontSize: 11, fontWeight: 600 }}>
                        <Eye size={11} /> Detay
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedId(null)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(248,250,252,0.25); }`}</style>
    </div>
  );
}
