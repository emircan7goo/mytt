'use client';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import { toast } from 'sonner';
import {
  CheckCircle2, XCircle, Clock, Package, Smartphone,
  Store, Loader2, RefreshCw, Eye, ChevronDown, ChevronUp,
  AlertTriangle, BadgeCheck, ShieldAlert, Image as ImageIcon,
} from 'lucide-react';

// ── Hooks ─────────────────────────────────────────────────────────────────────
function usePendingApprovals() {
  return useQuery({
    queryKey: ['admin', 'pending-approvals'],
    queryFn:  () => apiClient.get('/admin/pending-approvals').then(r => r.data),
    refetchInterval: 30_000,
  });
}

// ── Görsel galeri ─────────────────────────────────────────────────────────────
function ImageGallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images?.length) return (
    <div style={{ width: '100%', height: 120, background: 'rgba(255,255,255,0.03)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ImageIcon size={28} style={{ color: 'rgba(248,250,252,0.2)' }} />
    </div>
  );
  return (
    <div style={{ position: 'relative' }}>
      <img
        src={resolveUploadUrl(images[idx])}
        alt=""
        style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10, background: '#111' }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: 32, height: 32, borderRadius: 6, overflow: 'hidden', border: i === idx ? '2px solid #0ea5e9' : '2px solid transparent', cursor: 'pointer', padding: 0,
            }}>
              <img src={resolveUploadUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Onay Kartı ─────────────────────────────────────────────────────────────────
function ApprovalCard({
  title, subtitle, badge, images, meta, onApprove, onReject, loading,
}: {
  title: string; subtitle: string; badge?: string; images?: string[];
  meta?: { label: string; value: string }[];
  onApprove: (note?: string) => void; onReject: (note: string) => void; loading: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleAction = (type: 'approve' | 'reject') => {
    if (type === 'approve') { onApprove(note || undefined); }
    else { onReject(note || 'Admin tarafından reddedildi.'); }
    setAction(null);
    setNote('');
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden', transition: 'border-color 0.2s',
    }}>
      <div style={{ padding: '16px' }}>
        {/* Görsel */}
        {images && <div style={{ marginBottom: 12 }}><ImageGallery images={images} /></div>}

        {/* Başlık */}
        <div style={{ marginBottom: 8 }}>
          {badge && (
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: 'rgba(14,165,233,0.15)', color: '#0ea5e9', marginBottom: 6 }}>
              {badge}
            </span>
          )}
          <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14, margin: 0 }}>{title}</p>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 12, margin: '2px 0 0' }}>{subtitle}</p>
        </div>

        {/* Meta bilgiler */}
        {meta && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', marginBottom: 12 }}>
            {meta.map(({ label, value }) => (
              <span key={label} style={{ fontSize: 11, color: 'rgba(248,250,252,0.5)' }}>
                <span style={{ color: 'rgba(248,250,252,0.3)' }}>{label}: </span>{value}
              </span>
            ))}
          </div>
        )}

        {/* Not alanı */}
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="İsteğe bağlı not (reddetme sebebi vb.)"
          style={{
            width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 10,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc', fontSize: 12, outline: 'none', boxSizing: 'border-box',
          }}
        />

        {/* Aksiyonlar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleAction('approve')}
            disabled={loading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)',
              color: '#8B5CF6', transition: 'all 0.15s',
            }}
          >
            {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={13} />}
            Onayla
          </button>
          <button
            onClick={() => handleAction('reject')}
            disabled={loading}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              color: '#ef4444', transition: 'all 0.15s',
            }}
          >
            <XCircle size={13} /> Reddet
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Ana Sayfa ──────────────────────────────────────────────────────────────────
export default function AdminApprovalsPage() {
  const qc = useQueryClient();
  const { data, isLoading, refetch, isFetching } = usePendingApprovals();
  const [tab, setTab] = useState<'sell' | 'stock' | 'market'>('sell');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const invalidate = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['admin', 'pending-approvals'] });
  }, [qc]);

  const handleSellRequest = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setLoadingId(id);
    try {
      await apiClient.patch(`/admin/sell-requests/${id}/${action}`, { adminNote: note });
      toast.success(action === 'approve' ? 'Satış talebi onaylandı — bayiler teklif verebilir' : 'Satış talebi reddedildi');
      invalidate();
    } catch { toast.error('İşlem başarısız'); }
    finally { setLoadingId(null); }
  };

  const handleDealerStock = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setLoadingId(id);
    try {
      await apiClient.patch(`/admin/dealer-stock/${id}/${action}`, { adminNote: note });
      toast.success(action === 'approve' ? 'Stok onaylandı — marketplace\'de görünür' : 'Stok reddedildi');
      invalidate();
    } catch { toast.error('İşlem başarısız'); }
    finally { setLoadingId(null); }
  };

  const handleMarketItem = async (id: string, action: 'approve' | 'reject', note?: string) => {
    setLoadingId(id);
    try {
      await apiClient.patch(`/dealer-market/admin/${id}/${action}`, { adminNote: note });
      toast.success(action === 'approve' ? 'İlan onaylandı — aktif oldu' : 'İlan reddedildi');
      invalidate();
    } catch { toast.error('İşlem başarısız'); }
    finally { setLoadingId(null); }
  };

  const sellReqs   = data?.sellRequests       ?? [];
  const stocks     = data?.dealerStocks        ?? [];
  const mktItems   = data?.dealerMarketItems   ?? [];
  const totalCount = data?.totalCount          ?? 0;

  const TABS = [
    { key: 'sell',   label: 'Müşteri Satış Talepleri', count: sellReqs.length,  icon: <Smartphone size={14} /> },
    { key: 'stock',  label: 'Bayi Stok Girişleri',      count: stocks.length,    icon: <Package size={14} /> },
    { key: 'market', label: 'Bayi İlanları',             count: mktItems.length,  icon: <Store size={14} /> },
  ] as const;

  return (
    <div style={{ maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ color: '#f8fafc', fontSize: 24, fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>
              Onay Merkezi
            </h1>
            {totalCount > 0 && (
              <span style={{
                padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 800,
                background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
                animation: 'pulse 2s ease-in-out infinite',
              }}>
                {totalCount} bekliyor
              </span>
            )}
          </div>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: 13, margin: 0 }}>
            Müşteri satış talepleri, bayi stok girişleri ve bayi ilanlarını hızlıca onayla veya reddet
          </p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(248,250,252,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}>
          <RefreshCw size={13} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} /> Yenile
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(({ key, label, count, icon }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
            background: tab === key ? 'rgba(14,165,233,0.15)' : 'rgba(255,255,255,0.04)',
            border: tab === key ? '1px solid rgba(14,165,233,0.4)' : '1px solid rgba(255,255,255,0.07)',
            color: tab === key ? '#0ea5e9' : 'rgba(248,250,252,0.5)',
          }}>
            {icon} {label}
            {count > 0 && (
              <span style={{
                padding: '1px 7px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                background: tab === key ? 'rgba(14,165,233,0.25)' : 'rgba(239,68,68,0.15)',
                color: tab === key ? '#0ea5e9' : '#ef4444',
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* Müşteri Satış Talepleri */}
      {!isLoading && tab === 'sell' && (
        sellReqs.length === 0 ? (
          <EmptyState icon={<Smartphone size={40} />} text="Onay bekleyen satış talebi yok." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {sellReqs.map((req: any) => (
              <ApprovalCard
                key={req.id}
                title={`${req.brand} ${req.model}`}
                subtitle={`${req.user?.name ?? 'Müşteri'} — ${new Date(req.createdAt).toLocaleDateString('tr-TR')}`}
                badge="Müşteri Cihaz Satışı"
                images={req.imagesUrl}
                meta={[
                  { label: 'Grade', value: req.grade },
                  ...(req.storage ? [{ label: 'Depolama', value: req.storage }] : []),
                  ...(req.batteryHealth ? [{ label: 'Batarya', value: `%${req.batteryHealth}` }] : []),
                  { label: 'Durum', value: req.requestType === 'TRADE_IN' ? 'Trade-in' : 'Satış' },
                ]}
                loading={loadingId === req.id}
                onApprove={note => handleSellRequest(req.id, 'approve', note)}
                onReject={note => handleSellRequest(req.id, 'reject', note)}
              />
            ))}
          </div>
        )
      )}

      {/* Bayi Stok Girişleri */}
      {!isLoading && tab === 'stock' && (
        stocks.length === 0 ? (
          <EmptyState icon={<Package size={40} />} text="Onay bekleyen stok girişi yok." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {stocks.map((s: any) => (
              <ApprovalCard
                key={s.id}
                title={`${s.globalProduct?.brand ?? ''} ${s.globalProduct?.model ?? ''}`}
                subtitle={`${s.store?.owner?.companyName ?? s.store?.name ?? 'Bayi'} — ${new Date(s.createdAt).toLocaleDateString('tr-TR')}`}
                badge="Bayi Stok"
                images={s.dealerImages}
                meta={[
                  { label: 'Grade', value: s.grade },
                  { label: 'Fiyat', value: `₺${Number(s.price).toLocaleString('tr-TR')}` },
                  { label: 'Stok', value: String(s.stock) },
                  ...(s.batteryHealth ? [{ label: 'Batarya', value: `%${s.batteryHealth}` }] : []),
                ]}
                loading={loadingId === s.id}
                onApprove={note => handleDealerStock(s.id, 'approve', note)}
                onReject={note => handleDealerStock(s.id, 'reject', note)}
              />
            ))}
          </div>
        )
      )}

      {/* Bayi İlanları (Paslaşma) */}
      {!isLoading && tab === 'market' && (
        mktItems.length === 0 ? (
          <EmptyState icon={<Store size={40} />} text="Onay bekleyen bayi ilanı yok." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {mktItems.map((item: any) => (
              <ApprovalCard
                key={item.id}
                title={`${item.brand} ${item.model}`}
                subtitle={`${item.seller?.companyName ?? item.seller?.name ?? 'Bayi'} — ${item.listingType === 'AUCTION' ? 'Açık Artırma' : 'Sabit Fiyat'}`}
                badge="Bayi Paslaşma İlanı"
                images={item.images}
                meta={[
                  { label: 'Grade', value: item.grade },
                  { label: 'Taban Fiyat', value: `₺${Number(item.floorPrice).toLocaleString('tr-TR')}` },
                  ...(item.directPrice ? [{ label: 'Sabit Fiyat', value: `₺${Number(item.directPrice).toLocaleString('tr-TR')}` }] : []),
                  { label: 'Süre', value: item.durationHours >= 1 ? `${item.durationHours} saat` : '30 dakika' },
                ]}
                loading={loadingId === item.id}
                onApprove={note => handleMarketItem(item.id, 'approve', note)}
                onReject={note => handleMarketItem(item.id, 'reject', note)}
              />
            ))}
          </div>
        )
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.6; } }
      `}</style>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 16 }}>
      <div style={{ color: 'rgba(248,250,252,0.15)' }}>{icon}</div>
      <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: 16, margin: 0 }}>{text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 10, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <CheckCircle2 size={14} style={{ color: '#8B5CF6' }} />
        <span style={{ color: '#8B5CF6', fontSize: 12, fontWeight: 700 }}>Tüm kayıtlar onaylandı ✓</span>
      </div>
    </div>
  );
}
