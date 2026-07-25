'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminSellRequest, useAdminUpdateSellRequest } from '@/lib/hooks/useSellRequests';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Loader2, Battery, Package,
  User, Building2, Mail, Calendar, Truck, AlertTriangle, Shield,
  ImageIcon, Gavel, DollarSign, Hash,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: 'Teklif Açık',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  EXPIRED:   { label: 'Süre Doldu',     color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  ACCEPTED:  { label: 'Kabul Edildi',   color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  REJECTED:  { label: 'Reddedildi',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  SHIPPED:   { label: 'Kargoda',        color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
  RECEIVED:  { label: 'Depoda',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  COMPLETED: { label: 'Tamamlandı',     color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  CANCELLED: { label: 'İptal',          color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

const GRADE_COLORS: Record<string, string> = { 'A+': '#8B5CF6', A: '#0ea5e9', B: '#f59e0b', C: '#ef4444' };

export default function AdminSellRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: req, isLoading } = useAdminSellRequest(id);
  const updateMutation = useAdminUpdateSellRequest();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  if (isLoading || !req) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
        <Loader2 size={32} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const status = STATUS_MAP[req.status] ?? STATUS_MAP.PENDING;
  const bids = req.bids ?? [];
  const bestBid = bids[0];
  const timeLeft = req.expiresAt ? Math.max(0, new Date(req.expiresAt).getTime() - Date.now()) : 0;
  const isExpired = timeLeft <= 0;

  const handleStatusUpdate = async (newStatus: string) => {
    setBusy(true);
    try {
      await updateMutation.mutateAsync({ id: req.id, status: newStatus as any, adminNote: note || undefined });
      toast.success(`Durum güncellendi: ${newStatus}`);
    } catch { toast.error('Güncelleme başarısız'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 1000, paddingBottom: 40 }}>
      {/* Back */}
      <Link href="/admin/sell-requests" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'rgba(248,250,252,0.5)', fontSize: 13, fontWeight: 600,
        textDecoration: 'none', marginBottom: 20,
      }}>
        <ArrowLeft size={14} /> Satış Talepleri
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>
          {req.brand} {req.model}
        </h1>
        <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700, color: status.color, background: status.bg }}>
          {status.label}
        </span>
        <span style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800, color: GRADE_COLORS[req.grade] ?? '#fff', background: 'rgba(0,0,0,0.4)' }}>
          {req.grade}
        </span>
        <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 12, fontFamily: 'monospace' }}>
          #{req.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Sol: Cihaz + Görseller ────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Images */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
            {req.imagesUrl?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(req.imagesUrl.length, 3)}, 1fr)`, gap: 2 }}>
                {req.imagesUrl.map((url: string, i: number) => (
                  <img key={i} src={resolveUploadUrl(url)} alt="" style={{
                    width: '100%', height: i === 0 ? 200 : 120, objectFit: 'cover',
                    gridColumn: i === 0 && req.imagesUrl.length > 1 ? '1 / -1' : undefined,
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={40} style={{ color: 'rgba(248,250,252,0.15)' }} />
              </div>
            )}
          </div>

          {/* Cihaz detayları */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 18 }}>
            <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
              Cihaz Bilgileri
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 16px' }}>
              {[
                ['Marka', req.brand],
                ['Model', req.model],
                ['Depolama', req.storage ?? '—'],
                ['Renk', req.color ?? '—'],
                ['Batarya', req.batteryHealth ? `%${req.batteryHealth}` : '—'],
                ['Kutu', req.hasBox ? 'Var' : 'Yok'],
                ['Fatura', req.hasInvoice ? 'Var' : 'Yok'],
                ['Aksesuar', req.hasAccessories ? 'Var' : 'Yok'],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 11 }}>{k}</span>
                  <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 600, margin: '1px 0 0' }}>{v}</p>
                </div>
              ))}
            </div>
            {req.description && (
              <div style={{ marginTop: 12, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: 12, margin: 0 }}>{req.description}</p>
              </div>
            )}
          </div>

          {/* Müşteri bilgisi */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 18 }}>
            <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
              Müşteri
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={16} style={{ color: '#6366f1' }} />
              </div>
              <div>
                <p style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700, margin: 0 }}>{req.user?.name ?? 'Müşteri'}</p>
                <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 11, margin: 0 }}>{req.user?.email}</p>
              </div>
            </div>
          </div>

          {/* Zaman bilgileri */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 10 }}>Oluşturulma</span>
                <p style={{ color: '#f8fafc', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>{fmtDate(req.createdAt)}</p>
              </div>
              <div>
                <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 10 }}>Bitiş</span>
                <p style={{ color: isExpired ? '#ef4444' : '#f59e0b', fontSize: 12, fontWeight: 600, margin: '2px 0 0' }}>
                  {fmtDate(req.expiresAt)} {isExpired && '(Doldu)'}
                </p>
              </div>
              {req.shippingCode && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: 10 }}>Kargo Kodu</span>
                  <p style={{ color: '#0ea5e9', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', margin: '2px 0 0' }}>{req.shippingCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sağ: Teklifler + Aksiyonlar ───────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Teklifler */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Gavel size={14} style={{ color: '#a855f7' }} />
              <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>
                Gelen Teklifler ({bids.length})
              </p>
            </div>

            {bids.length === 0 ? (
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
                Henüz teklif gelmedi.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bids.map((bid: any, idx: number) => (
                  <div key={bid.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 12,
                    background: idx === 0 ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
                    border: idx === 0 ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    ...(bid.dealerId === req.winningDealerId ? { border: '2px solid #8B5CF6', background: 'rgba(139,92,246,0.1)' } : {}),
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: idx === 0 ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: idx === 0 ? '#8B5CF6' : 'rgba(248,250,252,0.4)',
                      fontSize: 12, fontWeight: 800,
                    }}>
                      #{idx + 1}
                    </div>

                    {/* Bayi bilgisi */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <Building2 size={11} style={{ color: 'rgba(248,250,252,0.4)' }} />
                        <span style={{ color: '#f8fafc', fontSize: 13, fontWeight: 700 }}>
                          {bid.dealer?.companyName ?? bid.dealer?.name ?? 'Bayi'}
                        </span>
                        {bid.dealerId === req.winningDealerId && (
                          <span style={{ padding: '1px 6px', borderRadius: 99, fontSize: 9, fontWeight: 800, background: '#8B5CF6', color: '#fff' }}>
                            KAZANAN
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10 }}>
                          <Mail size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                          {bid.dealer?.email}
                        </span>
                        <span style={{ color: 'rgba(248,250,252,0.25)', fontSize: 10 }}>
                          <Calendar size={9} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                          {fmtDate(bid.createdAt)}
                        </span>
                      </div>
                      {bid.note && (
                        <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: 11, margin: '4px 0 0', fontStyle: 'italic' }}>
                          "{bid.note}"
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ color: idx === 0 ? '#8B5CF6' : '#f8fafc', fontSize: 18, fontWeight: 800, margin: 0 }}>
                        {fmt(Number(bid.amount))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kazanan bayi */}
          {req.winningDealer && (
            <div style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 16, border: '1px solid rgba(139,92,246,0.2)', padding: 18 }}>
              <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
                Kazanan Bayi
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={16} style={{ color: '#8B5CF6' }} />
                </div>
                <div>
                  <p style={{ color: '#8B5CF6', fontSize: 14, fontWeight: 800, margin: 0 }}>
                    {req.winningDealer.companyName ?? req.winningDealer.name}
                  </p>
                  {req.finalPrice && (
                    <p style={{ color: 'rgba(139,92,246,0.7)', fontSize: 12, margin: '2px 0 0' }}>
                      Kabul edilen: {fmt(Number(req.finalPrice))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Admin aksiyonları */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 18 }}>
            <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>
              Admin Aksiyonları
            </p>
            <input
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="Admin notu (isteğe bağlı)"
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 10,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#f8fafc', fontSize: 12, outline: 'none', boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['PENDING', 'EXPIRED', 'ACCEPTED', 'COMPLETED', 'CANCELLED'].map(s => {
                const cfg = STATUS_MAP[s];
                return (
                  <button key={s} onClick={() => handleStatusUpdate(s)} disabled={busy || req.status === s}
                    style={{
                      padding: '7px 14px', borderRadius: 9, fontSize: 11, fontWeight: 700,
                      background: req.status === s ? `${cfg.color}25` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${req.status === s ? cfg.color + '40' : 'rgba(255,255,255,0.08)'}`,
                      color: cfg.color,
                      cursor: busy || req.status === s ? 'not-allowed' : 'pointer',
                      opacity: req.status === s ? 0.5 : 1,
                    }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(248,250,252,0.25); }
      `}</style>
    </div>
  );
}
