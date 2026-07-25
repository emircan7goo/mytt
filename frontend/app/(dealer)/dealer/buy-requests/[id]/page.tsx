'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Battery, Package, Loader2,
  Clock, CheckCircle, AlertCircle, Edit2, TrendingUp,
  Image as ImageIcon, Send, Users, Bell, Gavel,
} from 'lucide-react';
import { useDealerSellRequest, usePlaceBid } from '@/lib/hooks/useSellRequests';
import { resolveUploadUrl } from '@/lib/resolveUrl';

const GRADE_INFO: Record<string, { label: string; color: string }> = {
  'A+': { label: 'Tertemiz',   color: '#8B5CF6' },
  'A':  { label: 'Çok İyi',    color: '#0ea5e9' },
  'B':  { label: 'İyi',        color: '#f59e0b' },
  'C':  { label: 'Kabul Edilebilir', color: '#ef4444' },
};

// ── Canlı geri sayım ──────────────────────────────────────────────────────────
function Countdown({ expiresAt }: { expiresAt: string }) {
  const calc = () => Math.max(0, new Date(expiresAt).getTime() - Date.now());
  const [ms, setMs] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (ms <= 0) return <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '22px' }}>Süre Doldu</span>;
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return (
    <span style={{ color: '#f59e0b', fontWeight: 800, fontFamily: 'monospace', fontSize: '22px' }}>
      {h > 0 ? `${h}s ` : ''}{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
    </span>
  );
}

// ── Anonim teklif akışı ──────────────────────────────────────────────────────
function LiveBidFeed({ count, isOpen }: { count: number; isOpen: boolean }) {
  const prevRef = useRef(0);
  const [flashing, setFlashing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (count > prevRef.current && prevRef.current >= 0) {
      const diff = count - prevRef.current;
      const newEntries = Array.from({ length: diff }, (_, i) =>
        `Bayi #${prevRef.current + i + 1} teklif verdi`
      );
      setHistory(h => [...newEntries, ...h].slice(0, 5));
      setFlashing(true);
      setTimeout(() => setFlashing(false), 2000);
    }
    prevRef.current = count;
  }, [count]);

  return (
    <div style={{
      background: flashing ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      border: flashing ? '1px solid rgba(139,92,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
      padding: '20px', transition: 'all 0.4s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Users size={16} style={{ color: '#0ea5e9' }} />
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '14px' }}>Canlı Teklif Akışı</span>
        {isOpen && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6', boxShadow: '0 0 6px #8B5CF6', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <span style={{ color: '#8B5CF6', fontSize: '10px', fontWeight: 700 }}>CANLI</span>
          </div>
        )}
      </div>

      {/* Sayaç */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 14 }}>
        <span style={{ color: flashing ? '#8B5CF6' : '#f8fafc', fontSize: '42px', fontWeight: 900, lineHeight: 1, transition: 'color 0.3s' }}>{count}</span>
        <span style={{ color: 'rgba(248,250,252,0.4)', fontSize: '13px', paddingBottom: 6 }}>bayi teklif verdi</span>
        {flashing && <Bell size={16} style={{ color: '#8B5CF6', paddingBottom: 6, animation: 'bounce 0.5s ease-in-out 3' }} />}
      </div>

      {/* Gizli teklif açıklaması */}
      <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: history.length > 0 ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Gavel size={12} style={{ color: '#818cf8' }} />
          <span style={{ color: '#818cf8', fontSize: '11px', fontWeight: 600 }}>Teklifler anonim — diğer bayiler birbirinin fiyatını göremez</span>
        </div>
      </div>

      {/* Akış */}
      {history.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {history.map((entry, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 12px', borderRadius: '8px',
              background: i === 0 ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.02)',
              border: i === 0 ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
              opacity: 1 - i * 0.15,
              animation: i === 0 ? 'slideIn 0.3s ease-out' : 'none',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#8B5CF6' : 'rgba(248,250,252,0.2)', flexShrink: 0 }} />
              <span style={{ color: i === 0 ? '#8B5CF6' : 'rgba(248,250,252,0.4)', fontSize: '12px', fontWeight: i === 0 ? 700 : 500 }}>{entry}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Ana sayfa ─────────────────────────────────────────────────────────────────
export default function DealerBuyRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const { data: req, isLoading, refetch } = useDealerSellRequest(id);
  const placeBid = usePlaceBid();

  const [bidAmount, setBidAmount] = useState('');
  const [bidNote,   setBidNote]   = useState('');
  const [editing,   setEditing]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lightbox, setLightbox]   = useState<string | null>(null);

  const isOpen     = req?.status === 'PENDING';
  const isExpired  = req?.status === 'EXPIRED';
  const hasBid     = !!req?.myBid;
  const grade      = req ? (GRADE_INFO[req.grade] ?? { label: req.grade, color: '#f8fafc' }) : null;

  const handleBid = async () => {
    if (!bidAmount || isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) return;
    try {
      await placeBid.mutateAsync({ requestId: id, amount: Number(bidAmount), note: bidNote || undefined });
      setSubmitted(true);
      setEditing(false);
      refetch();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Teklif gönderilemedi.');
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
      <Loader2 size={32} style={{ color: 'rgba(248,250,252,0.3)', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
  if (!req) return (
    <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(248,250,252,0.4)' }}>
      Talep bulunamadı.
    </div>
  );

  return (
    <div style={{ maxWidth: '820px' }}>
      {/* Geri */}
      <button onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: 'rgba(248,250,252,0.4)', cursor: 'pointer', fontSize: '13px', marginBottom: 24, padding: 0 }}>
        <ArrowLeft size={15} /> Pazaryerine Dön
      </button>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'zoom-out' }}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* ── SOL ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Başlık kartı */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 800, background: 'rgba(255,255,255,0.06)', color: grade?.color ?? '#f8fafc' }}>
                {req.grade} — {grade?.label}
              </span>
              {req.status === 'PENDING' && <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>Teklif Açık</span>}
              {req.status === 'EXPIRED' && <span style={{ padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>Kapandı</span>}
            </div>
            <h1 style={{ color: '#f8fafc', fontSize: '26px', fontWeight: 700, margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              {req.brand} {req.model}
            </h1>
            <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '14px', margin: 0 }}>
              {[req.storage, req.color].filter(Boolean).join(' · ')}
            </p>
            {isOpen && (
              <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                <div>
                  <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>Kalan Süre</p>
                  <Countdown expiresAt={req.expiresAt} />
                </div>
              </div>
            )}
          </div>

          {/* Teknik detaylar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Cihaz Özellikleri</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Marka',        req.brand],
                ['Model',        req.model],
                ['Depolama',     req.storage ?? '—'],
                ['Renk',         req.color ?? '—'],
                ['Kozmetik',     `${req.grade} — ${grade?.label}`],
                ['Pil Sağlığı',  req.batteryHealth ? `%${req.batteryHealth}` : '—'],
                ['Kutu',         req.hasBox ? 'Var ✓' : 'Yok'],
                ['Fatura',       req.hasInvoice ? 'Var ✓' : 'Yok'],
                ['Aksesuar',     req.hasAccessories ? 'Var ✓' : 'Yok'],
                ['Teklif Sayısı',`${req.bidCount ?? 0} bayi`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '11px 14px' }}>
                  <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>{k}</p>
                  <p style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>
            {req.description && (
              <div style={{ marginTop: 12, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Açıklama</p>
                <p style={{ color: 'rgba(248,250,252,0.7)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>{req.description}</p>
              </div>
            )}
          </div>

          {/* Fotoğraflar */}
          {req.imagesUrl?.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ImageIcon size={12} /> Fotoğraflar ({req.imagesUrl.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {req.imagesUrl.map((url, i) => (
                  <div key={i} onClick={() => setLightbox(resolveUploadUrl(url))}
                    style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,0.05)', cursor: 'zoom-in', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <img src={resolveUploadUrl(url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              <p style={{ color: 'rgba(248,250,252,0.25)', fontSize: '11px', marginTop: 8, textAlign: 'center' }}>Tıklayarak büyüt</p>
            </div>
          )}
        </div>

        {/* ── SAĞ ────────────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Canlı teklif akışı */}
          <LiveBidFeed count={req.bidCount ?? 0} isOpen={isOpen} />

          {/* Kendi teklifim */}
          {hasBid && !editing && (
            <div style={{ background: 'rgba(139,92,246,0.07)', borderRadius: 16, border: '1px solid rgba(139,92,246,0.25)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CheckCircle size={18} style={{ color: '#8B5CF6' }} />
                <p style={{ color: '#8B5CF6', fontWeight: 700, fontSize: '14px', margin: 0 }}>Teklifiniz Gönderildi</p>
              </div>
              <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Teklif Tutarınız</p>
              <p style={{ color: '#8B5CF6', fontSize: '32px', fontWeight: 900, margin: '0 0 10px', fontFamily: 'monospace' }}>
                {Number(req.myBid!.amount).toLocaleString('tr-TR')} ₺
              </p>
              {req.myBid?.note && (
                <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '12px', margin: '0 0 12px', fontStyle: 'italic' }}>"{req.myBid.note}"</p>
              )}
              {isOpen && (
                <button onClick={() => { setEditing(true); setBidAmount(String(req.myBid!.amount)); setBidNote(req.myBid?.note ?? ''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 14px', color: 'rgba(248,250,252,0.6)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                  <Edit2 size={12} /> Teklifi Güncelle
                </button>
              )}
            </div>
          )}

          {/* Teklif formu */}
          {(isOpen && (!hasBid || editing)) && (
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <TrendingUp size={18} style={{ color: '#0ea5e9' }} />
                <p style={{ color: '#f8fafc', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                  {editing ? 'Teklifi Güncelle' : 'Teklif Ver'}
                </p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                  Teklif Tutarı (₺)
                </label>
                <div style={{ position: 'relative' }}>
                  <input type="number" min="1" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="0"
                    style={{ width: '100%', padding: '14px 40px 14px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f8fafc', fontSize: '20px', fontWeight: 800, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(248,250,252,0.3)', fontSize: '18px', fontWeight: 700, pointerEvents: 'none' }}>₺</span>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ color: 'rgba(248,250,252,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                  Not (isteğe bağlı)
                </label>
                <textarea rows={2} value={bidNote} onChange={e => setBidNote(e.target.value)} placeholder="Kısa bir not..."
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: 'rgba(248,250,252,0.8)', fontSize: '13px', outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
              </div>

              <button onClick={handleBid} disabled={!bidAmount || placeBid.isPending}
                style={{ width: '100%', padding: 14, background: bidAmount ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, color: bidAmount ? '#fff' : 'rgba(248,250,252,0.3)', fontSize: '14px', fontWeight: 800, cursor: bidAmount ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', boxShadow: bidAmount ? '0 4px 14px rgba(14,165,233,0.25)' : 'none' }}>
                {placeBid.isPending
                  ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Gönderiliyor...</>
                  : <><Send size={14} /> {editing ? 'Güncelle' : 'Teklif Gönder'}</>
                }
              </button>

              {editing && (
                <button onClick={() => { setEditing(false); setBidAmount(''); setBidNote(''); }}
                  style={{ width: '100%', marginTop: 8, padding: 10, background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'rgba(248,250,252,0.3)', fontSize: '12px', cursor: 'pointer' }}>
                  İptal
                </button>
              )}
            </div>
          )}

          {/* Süre doldu */}
          {isExpired && !hasBid && (
            <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: 16, border: '1px solid rgba(99,102,241,0.2)', padding: 20, textAlign: 'center' }}>
              <AlertCircle size={30} style={{ color: '#818cf8', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ color: '#818cf8', fontWeight: 700, margin: '0 0 6px' }}>Teklif Süresi Doldu</p>
              <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '12px', margin: 0 }}>Bu talep için teklif gönderme süresi sona erdi.</p>
            </div>
          )}

          {/* Nasıl çalışır */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)', padding: 16 }}>
            <p style={{ color: 'rgba(248,250,252,0.3)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Nasıl Çalışır?</p>
            {[
              ['Kapalı Teklif',    'Diğer bayilerin ne kadar teklif verdiğini göremezsiniz'],
              ['En Yüksek Teklif', 'Müşteri teklifler kapandığında en yüksek fiyatı seçer'],
              ['Kazanınca',        'Cihaz önce Mytt deposuna gelir, denetim sonrası ödeme yapılır'],
            ].map(([title, desc]) => (
              <div key={title} style={{ marginBottom: 9 }}>
                <p style={{ color: '#f8fafc', fontSize: '12px', fontWeight: 700, margin: '0 0 2px' }}>{title}</p>
                <p style={{ color: 'rgba(248,250,252,0.35)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:.4; } }
        @keyframes bounce  { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder, textarea::placeholder { color: rgba(248,250,252,0.25); }
        input:focus, textarea:focus { border-color: rgba(14,165,233,0.5) !important; }
      `}</style>
    </div>
  );
}
