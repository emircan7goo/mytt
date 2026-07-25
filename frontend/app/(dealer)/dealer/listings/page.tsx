'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Package, Clock, CheckCircle, XCircle, Loader2, Gavel, Tag,
  AlertTriangle, RefreshCw, Plus, ChevronDown, ChevronUp,
  Eye, Trash2, Battery, Box, FileText, Wrench,
} from 'lucide-react';
import { useMyDealerListings, useAcceptDealerBid, useCancelDealerListing } from '@/lib/hooks/useDealerMarket';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import type { DealerMarketItem, DealerMarketBid } from '@/lib/hooks/useDealerMarket';

// ── Formatters ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING_ADMIN: { label: 'Admin Onayı Bekliyor', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  icon: Clock },
  ACTIVE:        { label: 'Aktif',                color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)',  icon: CheckCircle },
  EXPIRED:       { label: 'Süre Doldu',           color: '#6366f1', bg: 'rgba(99,102,241,0.1)',  icon: Clock },
  SOLD:          { label: 'Satıldı',              color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)',  icon: CheckCircle },
  CANCELLED:     { label: 'İptal Edildi',         color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: XCircle },
  REJECTED:      { label: 'Reddedildi',           color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: XCircle },
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#8B5CF6', A: '#0ea5e9', B: '#f59e0b', C: '#ef4444',
};

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(expiresAt?: string | null) {
  const [, setTick] = useState(0);
  const calc = () => expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0;

  // Re-render every second
  useState(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  });

  const ms = calc();
  if (!expiresAt || ms <= 0) return null;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ item }: { item: DealerMarketItem }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const acceptBid = useAcceptDealerBid();
  const cancelListing = useCancelDealerListing();
  const countdown = useCountdown(item.expiresAt);

  const status = STATUS_MAP[item.status] ?? STATUS_MAP.PENDING_ADMIN;
  const StatusIcon = status.icon;
  const isAuction = item.listingType === 'AUCTION';
  const bids = (item as any).bids ?? [];
  const bidCount = (item as any)._count?.bids ?? bids.length;
  const canAcceptBids = item.status === 'ACTIVE' || item.status === 'EXPIRED';
  const canCancel = item.status !== 'SOLD' && item.status !== 'CANCELLED';

  const handleAcceptBid = async (bidId: string) => {
    setBusy(true);
    try {
      await acceptBid.mutateAsync({ itemId: item.id, bidId });
      toast.success('Teklif kabul edildi! Satış tamamlandı.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'İşlem başarısız');
    } finally { setBusy(false); }
  };

  const handleCancel = async () => {
    if (!confirm('İlanı iptal etmek istediğinize emin misiniz?')) return;
    setBusy(true);
    try {
      await cancelListing.mutateAsync(item.id);
      toast.success('İlan iptal edildi.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? 'İşlem başarısız');
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 18,
      border: `1px solid ${item.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
      overflow: 'hidden', transition: 'all 0.2s',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', gap: 14, padding: '16px 18px', alignItems: 'flex-start' }}>
        {/* Image */}
        <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)' }}>
          {item.images?.[0]
            ? <img src={resolveUploadUrl(item.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><Package size={28} style={{ color: 'rgba(248,250,252,0.2)' }} /></div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15, margin: 0 }}>{item.brand} {item.model}</p>
            <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 800, color: GRADE_COLORS[item.grade] ?? '#fff', background: 'rgba(0,0,0,0.4)' }}>{item.grade}</span>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700,
              color: isAuction ? '#a855f7' : '#0ea5e9',
              background: isAuction ? 'rgba(168,85,247,0.12)' : 'rgba(14,165,233,0.12)',
            }}>
              {isAuction ? <><Gavel size={9} /> Açık Artırma</> : <><Tag size={9} /> Sabit Fiyat</>}
            </span>
          </div>

          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 12, margin: '0 0 8px' }}>
            {[item.storage, item.color].filter(Boolean).join(' · ')}
            {item.batteryHealth ? ` · Pil %${item.batteryHealth}` : ''}
          </p>

          {/* Status + Timer + Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
              color: status.color, background: status.bg,
            }}>
              <StatusIcon size={11} /> {status.label}
            </span>

            {countdown && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
              }}>
                <Clock size={10} /> {countdown}
              </span>
            )}

            {isAuction && item.floorPrice && (
              <span style={{ color: 'rgba(248,250,252,0.5)', fontSize: 12, fontWeight: 600 }}>
                Taban: {fmt(Number(item.floorPrice))}
              </span>
            )}
            {!isAuction && item.directPrice && (
              <span style={{ color: '#0ea5e9', fontSize: 14, fontWeight: 800 }}>
                {fmt(Number(item.directPrice))}
              </span>
            )}

            {item.finalPrice && (
              <span style={{ color: '#8B5CF6', fontSize: 14, fontWeight: 800 }}>
                Satış: {fmt(Number(item.finalPrice))}
              </span>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
          {bidCount > 0 && (
            <button onClick={() => setExpanded(!expanded)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)',
              color: '#a855f7', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <Eye size={11} /> {bidCount} Teklif {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={busy} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 9, fontSize: 11, fontWeight: 700,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
              color: '#ef4444', cursor: busy ? 'not-allowed' : 'pointer',
            }}>
              <Trash2 size={10} /> İptal
            </button>
          )}
        </div>
      </div>

      {/* Admin note */}
      {item.adminNote && (
        <div style={{ padding: '0 18px 12px' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '8px 12px', borderRadius: 10,
            background: item.status === 'REJECTED' ? 'rgba(239,68,68,0.06)' : 'rgba(14,165,233,0.06)',
            border: item.status === 'REJECTED' ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(14,165,233,0.15)',
          }}>
            <AlertTriangle size={12} style={{ color: item.status === 'REJECTED' ? '#ef4444' : '#0ea5e9', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: item.status === 'REJECTED' ? '#ef4444' : '#0ea5e9', fontSize: 11, margin: 0 }}>
              <strong>Admin Notu:</strong> {item.adminNote}
            </p>
          </div>
        </div>
      )}

      {/* Bids panel */}
      {expanded && bids.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px' }}>
          <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
            Gelen Teklifler ({bids.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {bids.sort((a: any, b: any) => Number(b.amount) - Number(a.amount)).map((bid: any, idx: number) => (
              <div key={bid.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: idx === 0 ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                border: idx === 0 ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
              }}>
                {/* Rank */}
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: idx === 0 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: idx === 0 ? '#8B5CF6' : 'rgba(248,250,252,0.4)',
                  fontSize: 12, fontWeight: 800,
                }}>
                  #{idx + 1}
                </div>

                {/* Amount + Time */}
                <div style={{ flex: 1 }}>
                  <p style={{ color: idx === 0 ? '#8B5CF6' : '#f8fafc', fontSize: 15, fontWeight: 800, margin: 0 }}>
                    {fmt(Number(bid.amount))}
                  </p>
                  <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, margin: '1px 0 0' }}>
                    {fmtDate(bid.createdAt)}
                    {bid.note && <span style={{ marginLeft: 8, color: 'rgba(248,250,252,0.5)' }}>"{bid.note}"</span>}
                  </p>
                </div>

                {/* Accept button */}
                {canAcceptBids && (
                  <button onClick={() => handleAcceptBid(bid.id)} disabled={busy} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 14px', borderRadius: 9, fontSize: 11, fontWeight: 700,
                    background: idx === 0 ? '#8B5CF6' : 'rgba(16,185,129,0.12)',
                    border: idx === 0 ? 'none' : '1px solid rgba(16,185,129,0.25)',
                    color: idx === 0 ? '#fff' : '#8B5CF6',
                    cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                  }}>
                    {busy ? <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={11} />}
                    Kabul Et
                  </button>
                )}
              </div>
            ))}
          </div>

          {bids.length === 0 && (
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>
              Henüz teklif gelmedi.
            </p>
          )}
        </div>
      )}

      {/* Created date */}
      <div style={{ padding: '0 18px 12px' }}>
        <p style={{ color: 'rgba(248,250,252,0.2)', fontSize: 10, margin: 0 }}>
          Oluşturulma: {fmtDate(item.createdAt)}
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type Filter = 'all' | 'active' | 'pending' | 'sold' | 'expired';

export default function DealerMyListingsPage() {
  const { data: items, isLoading, refetch, isFetching } = useMyDealerListings();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = (items ?? []).filter(item => {
    if (filter === 'active')  return item.status === 'ACTIVE';
    if (filter === 'pending') return item.status === 'PENDING_ADMIN';
    if (filter === 'sold')    return item.status === 'SOLD';
    if (filter === 'expired') return item.status === 'EXPIRED' || item.status === 'CANCELLED' || item.status === 'REJECTED';
    return true;
  });

  const counts = {
    all:     (items ?? []).length,
    active:  (items ?? []).filter(i => i.status === 'ACTIVE').length,
    pending: (items ?? []).filter(i => i.status === 'PENDING_ADMIN').length,
    sold:    (items ?? []).filter(i => i.status === 'SOLD').length,
    expired: (items ?? []).filter(i => ['EXPIRED', 'CANCELLED', 'REJECTED'].includes(i.status)).length,
  };

  const FILTERS: { key: Filter; label: string; color: string }[] = [
    { key: 'all',     label: 'Tümü',      color: '#0ea5e9' },
    { key: 'active',  label: 'Aktif',      color: '#8B5CF6' },
    { key: 'pending', label: 'Bekleyen',   color: '#f59e0b' },
    { key: 'sold',    label: 'Satılan',    color: '#a855f7' },
    { key: 'expired', label: 'Kapanan',    color: '#6b7280' },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>
            Paslaşma İlanlarım
          </h1>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, margin: '4px 0 0' }}>
            Diğer bayilere sattığınız cihazlar ve gelen teklifler
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dealer/sell" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10, textDecoration: 'none',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#8B5CF6', fontSize: 12, fontWeight: 700,
          }}>
            <Plus size={13} /> Yeni İlan
          </Link>
          <button onClick={() => refetch()} disabled={isFetching} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <RefreshCw size={13} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} /> Yenile
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto' }}>
        {FILTERS.map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 9, fontSize: 12, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
            background: filter === key ? `${color}18` : 'rgba(255,255,255,0.04)',
            border: filter === key ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.07)',
            color: filter === key ? color : 'rgba(248,250,252,0.5)',
          }}>
            {label}
            {counts[key] > 0 && (
              <span style={{
                padding: '1px 6px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: filter === key ? `${color}25` : 'rgba(255,255,255,0.08)',
                color: filter === key ? color : 'rgba(248,250,252,0.4)',
              }}>{counts[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Package size={48} style={{ color: 'rgba(248,250,252,0.12)', margin: '0 auto 16px', display: 'block' }} />
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 15, fontWeight: 500 }}>
            {filter === 'all' ? 'Henüz ilan oluşturmadınız.' : 'Bu filtrede ilan yok.'}
          </p>
          <Link href="/dealer/sell" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginTop: 16, padding: '10px 22px', borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#8B5CF6', fontSize: 13, fontWeight: 700, textDecoration: 'none',
          }}>
            <Plus size={14} /> İlk İlanını Oluştur
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => <ListingCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
