'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Inbox, Clock, CheckCircle, XCircle, Loader2, Battery, Package,
  RefreshCw, TrendingUp, AlertCircle, WalletCards, Bell, Gavel,
  Tag, Users, Store, Plus,
} from 'lucide-react';
import { useDealerSellRequests } from '@/lib/hooks/useSellRequests';
import { useDealerMarketListings, useBuyDirect, usePlaceDealerBid } from '@/lib/hooks/useDealerMarket';
import { useApp } from '@/providers/AppProvider';
import { resolveUploadUrl } from '@/lib/resolveUrl';
import type { SellRequest, SellRequestStatus } from '@/lib/hooks/useSellRequests';
import type { DealerMarketItem } from '@/lib/hooks/useDealerMarket';

// ── Format yardımcıları ────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

// ── Countdown ─────────────────────────────────────────────────────────────────
function useCountdown(expiresAt?: string | null) {
  const calc = () => expiresAt ? Math.max(0, new Date(expiresAt).getTime() - Date.now()) : 0;
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    if (!expiresAt) return;
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  if (!expiresAt) return null;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return ms > 0 ? `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : 'Süre doldu';
}

// ── Status maps ────────────────────────────────────────────────────────────────

const SELL_STATUS_MAP: Record<SellRequestStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  PENDING:   { label: 'Teklif Açık',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: Clock        },
  EXPIRED:   { label: 'Teklif Kapandı', color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  icon: AlertCircle  },
  ACCEPTED:  { label: 'Kabul Edildi',   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle  },
  REJECTED:  { label: 'Reddedildi',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: XCircle      },
  SHIPPED:   { label: 'Kargoda',        color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  icon: Package      },
  RECEIVED:  { label: 'Depoda',         color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: CheckCircle  },
  COMPLETED: { label: 'Tamamlandı',     color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: CheckCircle  },
  CANCELLED: { label: 'İptal',          color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: XCircle      },
};

const GRADE_COLORS: Record<string, string> = {
  'A+': '#10b981', A: '#0ea5e9', B: '#f59e0b', C: '#ef4444',
};

// ── Müşteri satış talebi kartı ─────────────────────────────────────────────────

function CustomerCard({ req, hasNoBalance }: { req: SellRequest; hasNoBalance: boolean }) {
  const status   = SELL_STATUS_MAP[req.status] ?? SELL_STATUS_MAP.PENDING;
  const Icon     = status.icon;
  const isOpen   = req.status === 'PENDING';
  const hasBid   = !!req.myBid;
  const countdown = useCountdown(req.expiresAt);

  return (
    <Link href={`/dealer/buy-requests/${req.id}`}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
        border: hasBid ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)',
        overflow: 'hidden', textDecoration: 'none', transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(14,165,233,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.border = hasBid ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)')}
    >
      {/* Resim */}
      <div style={{ height: '100px', position: 'relative', background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.05))' }}>
        {req.imagesUrl?.[0]
          ? <img src={resolveUploadUrl(req.imagesUrl[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><span style={{ fontSize: 36 }}>📱</span></div>
        }
        {/* Source badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: '6px',
          background: 'rgba(99,102,241,0.85)', color: '#fff', fontSize: '9px', fontWeight: 700,
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Users size={9} /> MÜŞTERİ
        </div>
        {/* Grade */}
        <div style={{
          position: 'absolute', top: 8, right: isOpen ? 56 : 8, padding: '3px 8px',
          borderRadius: '99px', fontSize: '11px', fontWeight: 800,
          background: 'rgba(0,0,0,0.6)', color: GRADE_COLORS[req.grade] ?? '#fff', backdropFilter: 'blur(4px)',
        }}>{req.grade}</div>
        {/* Timer */}
        {isOpen && countdown && (
          <div style={{
            position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 700,
            background: countdown === 'Süre doldu' ? 'rgba(99,102,241,0.85)' : 'rgba(245,158,11,0.85)', color: '#fff', backdropFilter: 'blur(4px)',
          }}>{countdown}</div>
        )}
      </div>

      {/* İçerik */}
      <div style={{ padding: '14px', flex: 1 }}>
        <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{req.brand} {req.model}</p>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', margin: '0 0 10px' }}>{[req.storage, req.color].filter(Boolean).join(' · ')}</p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {req.batteryHealth && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>
              <Battery size={9} /> %{req.batteryHealth}
            </span>
          )}
          {req.hasBox     && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>Kutulu</span>}
          {req.hasInvoice && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>Faturalı</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: '99px', background: status.bg }}>
            <Icon size={11} style={{ color: status.color }} />
            <span style={{ color: status.color, fontSize: '10px', fontWeight: 700 }}>{status.label}</span>
          </div>
          {isOpen && hasNoBalance && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: '99px', background: 'rgba(245,158,11,0.1)' }}>
              <WalletCards size={9} style={{ color: '#f59e0b' }} />
              <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 700 }}>Bakiye yükle</span>
            </div>
          )}
          {!hasNoBalance && hasBid
            ? <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 800 }}>Teklifim: {fmt(Number(req.myBid!.amount))}</span>
            : !hasNoBalance && isOpen
            ? <span style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>Teklif Ver →</span>
            : null
          }
        </div>
        {req.bidCount !== undefined && (
          <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', marginTop: 6 }}>{req.bidCount} bayi teklif verdi</p>
        )}
      </div>
    </Link>
  );
}

// ── Bayi ilânı kartı ──────────────────────────────────────────────────────────

function DealerItemCard({ item, hasNoBalance }: { item: DealerMarketItem; hasNoBalance: boolean }) {
  const router = useRouter();
  const [bidAmt, setBidAmt]   = useState('');
  const [showBid, setShowBid] = useState(false);
  const [busy, setBusy]       = useState(false);
  const [msg, setMsg]         = useState('');

  const placeBid  = usePlaceDealerBid();
  const buyDirect = useBuyDirect();
  const countdown = useCountdown(item.expiresAt);
  const isAuction = item.listingType === 'AUCTION';
  const isOpen    = item.status === 'ACTIVE';
  const hasBid    = !!item.myBid;

  const handleBid = async () => {
    if (!bidAmt) return;
    setBusy(true); setMsg('');
    try {
      await placeBid.mutateAsync({ itemId: item.id, amount: Number(bidAmt) });
      setMsg('Teklif verildi!'); setShowBid(false); setBidAmt('');
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? 'Hata oluştu');
    } finally { setBusy(false); }
  };

  const handleBuy = async () => {
    setBusy(true); setMsg('');
    try {
      await buyDirect.mutateAsync(item.id);
      setMsg('Satın alındı! Satıcı ile iletişime geçin.');
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? 'Hata oluştu');
    } finally { setBusy(false); }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
      border: hasBid ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden', transition: 'all 0.2s',
    }}>
      {/* Resim */}
      <div style={{ height: '100px', position: 'relative', background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(14,165,233,0.05))' }}>
        {item.images?.[0]
          ? <img src={resolveUploadUrl(item.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}><span style={{ fontSize: 36 }}>📱</span></div>
        }
        {/* Kaynak badge */}
        <div style={{
          position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: '6px',
          background: 'rgba(168,85,247,0.85)', color: '#fff', fontSize: '9px', fontWeight: 700,
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <Store size={9} /> BAYİ
        </div>
        {/* Grade */}
        <div style={{
          position: 'absolute', top: 8, right: (isAuction && countdown) ? 60 : 8, padding: '3px 8px',
          borderRadius: '99px', fontSize: '11px', fontWeight: 800,
          background: 'rgba(0,0,0,0.6)', color: GRADE_COLORS[item.grade] ?? '#fff', backdropFilter: 'blur(4px)',
        }}>{item.grade}</div>
        {/* Tip / Timer */}
        {isAuction && countdown && isOpen ? (
          <div style={{
            position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
            background: 'rgba(168,85,247,0.85)', color: '#fff', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Gavel size={9} /> {countdown}
          </div>
        ) : !isAuction && (
          <div style={{
            position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 700,
            background: 'rgba(14,165,233,0.85)', color: '#fff', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <Tag size={9} /> Sabit
          </div>
        )}
      </div>

      {/* İçerik */}
      <div style={{ padding: '14px', flex: 1 }}>
        <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px', margin: '0 0 2px' }}>{item.brand} {item.model}</p>
        <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', margin: '0 0 8px' }}>
          {[item.storage, item.color, item.grade].filter(Boolean).join(' · ')}
        </p>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {item.batteryHealth && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'rgba(14,165,233,0.1)', color: '#0ea5e9', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>
              <Battery size={9} /> %{item.batteryHealth}
            </span>
          )}
          {item.hasBox     && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>Kutulu</span>}
          {item.hasInvoice && <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '99px' }}>Faturalı</span>}
        </div>

        {/* Fiyat */}
        {isAuction ? (
          <div style={{ marginBottom: 10 }}>
            {item.floorPrice ? (
              <p style={{ color: '#a855f7', fontSize: '14px', fontWeight: 800, margin: 0 }}>Taban: {fmt(Number(item.floorPrice))}</p>
            ) : (
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', margin: 0 }}>Taban fiyat yok</p>
            )}
            {hasBid && item.myBid && (
              <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 700, margin: '4px 0 0' }}>Teklifim: {fmt(Number(item.myBid.amount))}</p>
            )}
            {item.bidCount !== undefined && (
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', margin: '2px 0 0' }}>{item.bidCount} teklif</p>
            )}
          </div>
        ) : (
          <p style={{ color: '#0ea5e9', fontSize: '16px', fontWeight: 800, margin: '0 0 10px' }}>
            {item.directPrice ? fmt(Number(item.directPrice)) : '—'}
          </p>
        )}

        {/* Mesaj */}
        {msg && (
          <p style={{ color: msg.includes('alındı') || msg.includes('verildi') ? '#10b981' : '#ef4444', fontSize: '11px', fontWeight: 600, margin: '0 0 8px' }}>{msg}</p>
        )}

        {/* Aksiyonlar */}
        {isOpen && !hasNoBalance && (
          isAuction ? (
            showBid ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={bidAmt} onChange={e => setBidAmt(e.target.value)} type="number"
                  placeholder="Teklif tutarı (₺)"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '9px', fontSize: '13px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', outline: 'none', minWidth: 0 }} />
                <button onClick={handleBid} disabled={busy}
                  style={{ padding: '8px 14px', borderRadius: '9px', background: '#a855f7', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>
                  {busy ? '...' : 'Gönder'}
                </button>
                <button onClick={() => setShowBid(false)}
                  style={{ padding: '8px', borderRadius: '9px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,250,252,0.5)', cursor: 'pointer', fontSize: '12px' }}>
                  ✕
                </button>
              </div>
            ) : (
              <button onClick={() => setShowBid(true)}
                style={{ width: '100%', padding: '9px', borderRadius: '10px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#a855f7', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Gavel size={13} /> {hasBid ? 'Teklifi Güncelle' : 'Teklif Ver'}
              </button>
            )
          ) : (
            <button onClick={handleBuy} disabled={busy}
              style={{ width: '100%', padding: '9px', borderRadius: '10px', background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9', fontSize: '12px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {busy ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Tag size={13} />}
              {busy ? 'İşleniyor...' : 'Hemen Satın Al'}
            </button>
          )
        )}

        {isOpen && hasNoBalance && (
          <div style={{ padding: '8px 12px', borderRadius: '9px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <WalletCards size={12} style={{ color: '#f59e0b' }} />
            <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>Bakiye yükleyin</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────

type Tab = 'all' | 'customer' | 'dealer';

export default function DealerBuyRequestsPage() {
  const { user } = useApp();
  const router = useRouter();
  const { data: customerReqs, isLoading: custLoading, refetch: refetchCust, isFetching: custFetching } = useDealerSellRequests();
  const { data: dealerItems,  isLoading: dealLoading, refetch: refetchDealer, isFetching: dealFetching } = useDealerMarketListings();
  const [tab, setTab] = useState<Tab>('all');
  const [custFilter, setCustFilter] = useState<'all' | 'open' | 'mybids'>('all');
  const [dealFilter, setDealFilter] = useState<'all' | 'auction' | 'direct'>('all');
  const [newBadge, setNewBadge] = useState(0);
  const prevCustCount = useRef(0);

  const hasNoBalance = !user || Number((user as any).walletBalance ?? 0) <= 0;
  const isLoading = custLoading && dealLoading;
  const isFetching = custFetching || dealFetching;

  // Yeni müşteri talebi bildirimi
  useEffect(() => {
    const cur = customerReqs?.filter(r => r.status === 'PENDING').length ?? 0;
    if (prevCustCount.current > 0 && cur > prevCustCount.current) {
      setNewBadge(cur - prevCustCount.current);
      setTimeout(() => setNewBadge(0), 8000);
    }
    prevCustCount.current = cur;
  }, [customerReqs]);

  const filteredCust = (customerReqs ?? []).filter(r => {
    if (custFilter === 'open')   return r.status === 'PENDING';
    if (custFilter === 'mybids') return !!r.myBid;
    return true;
  });

  const filteredDeal = (dealerItems ?? []).filter(item => {
    if (dealFilter === 'auction') return item.listingType === 'AUCTION';
    if (dealFilter === 'direct')  return item.listingType === 'DIRECT';
    return true;
  });

  const openCustCount  = (customerReqs ?? []).filter(r => r.status === 'PENDING').length;
  const myBidCustCount = (customerReqs ?? []).filter(r => !!r.myBid).length;
  const activeDeal     = (dealerItems ?? []).filter(i => i.status === 'ACTIVE').length;
  const myBidDeal      = (dealerItems ?? []).filter(i => !!i.myBid).length;

  const refetch = () => { refetchCust(); refetchDealer(); };

  const TAB_DEFS: { key: Tab; label: string; badge?: number; icon: React.ElementType }[] = [
    { key: 'all',      label: 'Tümü',            badge: openCustCount + activeDeal, icon: Inbox  },
    { key: 'customer', label: 'Müşteri Cihazları',badge: openCustCount,             icon: Users  },
    { key: 'dealer',   label: 'Bayi Cihazları',   badge: activeDeal,                icon: Store  },
  ];

  return (
    <div style={{ maxWidth: '1100px' }}>

      {/* Bakiye uyarısı */}
      {hasNoBalance && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderRadius: '12px', marginBottom: 18, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
          <WalletCards size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: '13px', margin: 0 }}>Bakiyeniz yetersiz</p>
            <p style={{ color: 'rgba(245,158,11,0.7)', fontSize: '11px', margin: '2px 0 0' }}>Teklif vermek için admin ile iletişime geçin ve bakiye yükleyin.</p>
          </div>
        </div>
      )}

      {/* Yeni talep badge */}
      {newBadge > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: '12px', marginBottom: 18, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <Bell size={16} style={{ color: '#10b981' }} />
          <p style={{ color: '#10b981', fontWeight: 800, fontSize: '13px', margin: 0 }}>{newBadge} yeni müşteri talebi!</p>
        </div>
      )}

      {/* Başlık */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: 12 }}>
        <div>
          <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 300, letterSpacing: '-0.5px', margin: 0 }}>Pazaryeri</h1>
          <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', margin: '4px 0 0' }}>Müşteri ve bayi cihazlarını tek yerde — teklif verin veya hemen satın alın</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/dealer/sell')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={13} /> Cihaz Sat
          </button>
          <button onClick={refetch} disabled={isFetching}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(248,250,252,0.6)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={13} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} /> Yenile
          </button>
        </div>
      </div>

      {/* İstatistikler */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: 'Açık Müşteri',   value: openCustCount,  color: '#f59e0b', icon: Clock      },
          { label: 'Müşteri Tekl.',  value: myBidCustCount, color: '#10b981', icon: TrendingUp  },
          { label: 'Aktif Bayi',     value: activeDeal,     color: '#a855f7', icon: Store       },
          { label: 'Bayi Tekl.',     value: myBidDeal,      color: '#0ea5e9', icon: Gavel       },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', margin: 0 }}>{label}</p>
              <p style={{ color, fontSize: '22px', fontWeight: 800, margin: '1px 0 0' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sekme şeridi */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
        {TAB_DEFS.map(({ key, label, badge, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid',
              background: tab === key ? '#0ea5e9' : 'rgba(255,255,255,0.04)',
              borderColor: tab === key ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
              color: tab === key ? '#fff' : 'rgba(248,250,252,0.55)',
            }}>
            <Icon size={13} /> {label}
            {!!badge && (
              <span style={{ background: tab === key ? 'rgba(255,255,255,0.25)' : 'rgba(14,165,233,0.2)', color: tab === key ? '#fff' : '#0ea5e9', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '99px', minWidth: 18, textAlign: 'center' }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Alt filtreler */}
      {(tab === 'all' || tab === 'customer') && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, alignSelf: 'center', marginRight: 4 }}>MÜŞTERİ:</span>
          {[
            { key: 'all',    label: 'Tümü' },
            { key: 'open',   label: `Açık (${openCustCount})` },
            { key: 'mybids', label: `Tekliflerim (${myBidCustCount})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setCustFilter(key as any)}
              style={{
                padding: '5px 13px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                background: custFilter === key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                border: custFilter === key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.07)',
                color: custFilter === key ? '#818cf8' : 'rgba(248,250,252,0.45)',
              }}>{label}</button>
          ))}
        </div>
      )}

      {(tab === 'all' || tab === 'dealer') && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          <span style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, alignSelf: 'center', marginRight: 4 }}>BAYİ:</span>
          {[
            { key: 'all',     label: 'Tümü' },
            { key: 'auction', label: 'Açık Artırma' },
            { key: 'direct',  label: 'Sabit Fiyat'  },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setDealFilter(key as any)}
              style={{
                padding: '5px 13px', borderRadius: '8px', fontSize: '11px', fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.15s',
                background: dealFilter === key ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.04)',
                border: dealFilter === key ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.07)',
                color: dealFilter === key ? '#a855f7' : 'rgba(248,250,252,0.45)',
              }}>{label}</button>
          ))}
        </div>
      )}

      {/* İçerik */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 size={32} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <>
          {/* Müşteri cihazları bölümü */}
          {(tab === 'all' || tab === 'customer') && filteredCust.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              {tab === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Users size={14} style={{ color: '#818cf8' }} />
                  <h3 style={{ color: '#818cf8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    Müşteri Cihazları ({filteredCust.length})
                  </h3>
                  <div style={{ flex: 1, height: 1, background: 'rgba(99,102,241,0.15)' }} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {filteredCust.map(r => <CustomerCard key={r.id} req={r} hasNoBalance={hasNoBalance} />)}
              </div>
            </div>
          )}

          {/* Bayi cihazları bölümü */}
          {(tab === 'all' || tab === 'dealer') && filteredDeal.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              {tab === 'all' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Store size={14} style={{ color: '#a855f7' }} />
                  <h3 style={{ color: '#a855f7', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                    Bayi Cihazları ({filteredDeal.length})
                  </h3>
                  <div style={{ flex: 1, height: 1, background: 'rgba(168,85,247,0.15)' }} />
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                {filteredDeal.map(i => <DealerItemCard key={i.id} item={i} hasNoBalance={hasNoBalance} />)}
              </div>
            </div>
          )}

          {/* Boş durum */}
          {((tab === 'all' && filteredCust.length === 0 && filteredDeal.length === 0) ||
            (tab === 'customer' && filteredCust.length === 0) ||
            (tab === 'dealer' && filteredDeal.length === 0)) && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Inbox size={48} style={{ color: 'rgba(248,250,252,0.12)', margin: '0 auto 16px', display: 'block' }} />
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '15px', fontWeight: 500 }}>
                {tab === 'customer' ? 'Müşteri cihazı yok.' : tab === 'dealer' ? 'Bayi ilanı yok.' : 'Pazaryeri henüz boş.'}
              </p>
              {tab === 'dealer' && (
                <button onClick={() => router.push('/dealer/sell')}
                  style={{ marginTop: 16, padding: '10px 22px', borderRadius: '10px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Plus size={14} /> İlk ilanı sen oluştur
                </button>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(248,250,252,0.25); }
        input:focus { border-color: rgba(14,165,233,0.5) !important; outline: none; }
        button:hover:not(:disabled) { filter: brightness(1.08); }
      `}</style>
    </div>
  );
}
