'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Clock, CheckCircle, XCircle, Loader2, Eye, Gavel, DollarSign,
  ArrowRight, User, Building2, Package, Filter,
} from 'lucide-react';
import { useAdminSellRequests, useAdminSellRequestStats } from '@/lib/hooks/useSellRequests';
import type { SellRequest, SellRequestStatus } from '@/lib/hooks/useSellRequests';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
});

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Teklif Açık',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  EXPIRED:   { label: 'Süre Doldu',     color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ACCEPTED:  { label: 'Kabul Edildi',   color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)' },
  REJECTED:  { label: 'Reddedildi',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  SHIPPED:   { label: 'Kargoda',        color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  RECEIVED:  { label: 'Depoda',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  COMPLETED: { label: 'Tamamlandı',     color: '#8B5CF6', bg: 'rgba(16,185,129,0.1)' },
  CANCELLED: { label: 'İptal',          color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

export default function AdminSellRequestsPage() {
  const [statusFilter, setStatusFilter] = useState<SellRequestStatus | undefined>(undefined);
  const { data, isLoading } = useAdminSellRequests({ status: statusFilter, take: 100 });
  const { data: stats } = useAdminSellRequestStats();
  const items = data?.items ?? [];

  const STAT_CARDS = [
    { label: 'Toplam', value: stats?.total ?? 0, color: '#0ea5e9' },
    { label: 'Bekleyen', value: stats?.pending ?? 0, color: '#f59e0b' },
    { label: 'Süre Doldu', value: stats?.expired ?? 0, color: '#6366f1' },
    { label: 'Kabul', value: stats?.accepted ?? 0, color: '#8B5CF6' },
    { label: 'Tamamlanan', value: stats?.completed ?? 0, color: '#7C3AED' },
    { label: 'Toplam Teklif', value: stats?.totalBids ?? 0, color: '#a855f7' },
    { label: 'Ort. Teklif', value: stats?.avgBids ?? '0', color: '#f43f5e' },
  ];

  const FILTER_TABS: { key: SellRequestStatus | undefined; label: string }[] = [
    { key: undefined, label: 'Tümü' },
    { key: 'PENDING' as any, label: 'Bekleyen' },
    { key: 'EXPIRED' as any, label: 'Süre Doldu' },
    { key: 'ACCEPTED' as any, label: 'Kabul Edildi' },
    { key: 'SHIPPED' as any, label: 'Kargoda' },
    { key: 'COMPLETED' as any, label: 'Tamamlanan' },
    { key: 'REJECTED' as any, label: 'Reddedilen' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', margin: '0 0 4px' }}>
          Satış Talepleri
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, margin: 0 }}>
          Müşterilerden gelen cihaz satış talepleri — teklifler ve bayi eşleştirmesi
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, marginBottom: 20 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)', padding: '12px 14px', textAlign: 'center',
          }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: 22, fontWeight: 800, margin: '4px 0 0' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, overflowX: 'auto', paddingBottom: 2 }}>
        {FILTER_TABS.map(t => (
          <button key={t.label} onClick={() => setStatusFilter(t.key)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            background: statusFilter === t.key ? 'rgba(14,165,233,0.12)' : 'rgba(255,255,255,0.04)',
            border: statusFilter === t.key ? '1px solid rgba(14,165,233,0.3)' : '1px solid rgba(255,255,255,0.06)',
            color: statusFilter === t.key ? '#0ea5e9' : 'rgba(248,250,252,0.5)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={28} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Package size={40} style={{ color: 'rgba(248,250,252,0.12)', margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 14 }}>Bu filtrede talep bulunamadı.</p>
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Cihaz', 'Müşteri', 'Durum', 'Teklifler', 'En İyi', 'Tarih', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: 'rgba(248,250,252,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((r: SellRequest) => {
                const cfg = STATUS_MAP[r.status] ?? STATUS_MAP.PENDING;
                const bidCount = r.bids?.length ?? (r as any)._count?.bids ?? 0;
                const bestBid = r.bids?.[0];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    {/* Cihaz */}
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, margin: 0 }}>{r.brand} {r.model}</p>
                      <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, margin: '2px 0 0' }}>
                        {[r.storage, r.color, r.grade].filter(Boolean).join(' · ')}
                      </p>
                    </td>
                    {/* Müşteri */}
                    <td style={{ padding: '12px 14px' }}>
                      <p style={{ color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: 600, margin: 0 }}>{r.user?.name ?? '—'}</p>
                      <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 10, margin: 0 }}>{r.user?.email}</p>
                    </td>
                    {/* Durum */}
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </td>
                    {/* Teklifler */}
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Gavel size={11} style={{ color: '#a855f7' }} />
                        <span style={{ color: bidCount > 0 ? '#a855f7' : 'rgba(248,250,252,0.3)', fontSize: 14, fontWeight: 800 }}>
                          {bidCount}
                        </span>
                      </div>
                    </td>
                    {/* En iyi */}
                    <td style={{ padding: '12px 14px' }}>
                      {bestBid ? (
                        <div>
                          <p style={{ color: '#8B5CF6', fontSize: 14, fontWeight: 800, margin: 0 }}>{fmt(Number(bestBid.amount))}</p>
                          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 9, margin: '1px 0 0' }}>
                            {bestBid.dealer?.companyName ?? bestBid.dealer?.name ?? '—'}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(248,250,252,0.2)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    {/* Tarih */}
                    <td style={{ padding: '12px 14px', color: 'rgba(248,250,252,0.4)', fontSize: 11 }}>
                      {fmtDate(r.createdAt)}
                    </td>
                    {/* Detay */}
                    <td style={{ padding: '12px 14px' }}>
                      <Link href={`/admin/sell-requests/${r.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 10px', borderRadius: 7, textDecoration: 'none',
                        background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.2)',
                        color: '#0ea5e9', fontSize: 10, fontWeight: 700,
                      }}>
                        <Eye size={10} /> Detay
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
