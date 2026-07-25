'use client';
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { AlertTriangle, CheckCircle, XCircle, Clock, MessageSquare, RefreshCw } from 'lucide-react';

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  OPEN:      { label:'Açık',        color:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',   icon: <AlertTriangle size={12}/> },
  IN_REVIEW: { label:'İnceleniyor', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.25)', icon: <Clock size={12}/>         },
  RESOLVED:  { label:'Çözüldü',     color:'#F97316', bg:'rgba(249,115,22,0.1)', border:'rgba(249,115,22,0.25)', icon: <CheckCircle size={12}/>   },
  ESCALATED: { label:'Eskalasyon',  color:'#a855f7', bg:'rgba(168,85,247,0.1)', border:'rgba(168,85,247,0.25)', icon: <XCircle size={12}/>       },
  REFUNDED:  { label:'İade',        color:'#ef4444', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',   icon: <RefreshCw size={12}/>    },
};

const TYPE_LABELS: Record<string, string> = {
  iade_talebi: 'İade Talebi', hasar: 'Kargo Hasarı',
  teslim_edilmedi: 'Teslim Edilmedi', yanlis_urun: 'Yanlış Ürün',
};

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY', maximumFractionDigits:0 }).format(n);

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [note, setNote]         = useState('');
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    apiClient.get('/admin/disputes')
      .then(r => setDisputes(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateStatus = async (id: string, status: string, adminNote?: string) => {
    setSaving(true);
    await apiClient.patch(`/admin/disputes/${id}/status`, { status, note: adminNote }).catch(() => {});
    setSaving(false);
    setSelected(null);
    setNote('');
    load();
  };

  const stats = {
    open:      disputes.filter(d => d.disputeStatus === 'OPEN').length,
    inReview:  disputes.filter(d => d.disputeStatus === 'IN_REVIEW').length,
    escalated: disputes.filter(d => d.disputeStatus === 'ESCALATED').length,
    resolved:  disputes.filter(d => d.disputeStatus === 'RESOLVED' || d.paymentStatus === 'REFUNDED').length,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      <div>
        <h2 style={{ color:'#f8fafc', fontSize:'22px', fontWeight:800, letterSpacing:'-0.5px', marginBottom:'4px' }}>
          Anlaşmazlık Çözüm Merkezi
        </h2>
        <p style={{ color:'rgba(248,250,252,0.4)', fontSize:'13px' }}>
          Güvence kapsamındaki ve itirazlı siparişleri yönetin.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
        {[
          { label:'Açık Ticket', count:stats.open,      color:'#ef4444' },
          { label:'İnceleniyor', count:stats.inReview,  color:'#f59e0b' },
          { label:'Eskalasyon',  count:stats.escalated, color:'#a855f7' },
          { label:'Çözüldü',     count:stats.resolved,  color:'#F97316' },
        ].map(s => (
          <div key={s.label} style={{ padding:'16px 20px', borderRadius:'12px', background:`${s.color}08`, border:`1px solid ${s.color}22` }}>
            <div style={{ fontSize:'24px', fontWeight:800, color:s.color }}>{loading ? '…' : s.count}</div>
            <div style={{ color:'rgba(248,250,252,0.4)', fontSize:'12px', marginTop:'2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap:'20px' }}>
        {/* Table */}
        <div style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                {['Sipariş', 'Ürün', 'Tür', 'Tutar', 'Durum', 'Tarih', 'Aksiyon'].map(h => (
                  <th key={h} style={{ padding:'14px 18px', textAlign:'left', color:'rgba(248,250,252,0.55)', fontSize:'11px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'rgba(248,250,252,0.55)', fontSize:'13px' }}>Yükleniyor…</td></tr>
              ) : disputes.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'40px', textAlign:'center', color:'rgba(248,250,252,0.55)', fontSize:'13px' }}>Anlaşmazlık bulunamadı</td></tr>
              ) : disputes.map((d, i) => {
                const status = d.disputeStatus || (d.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'OPEN');
                const cfg = STATUS_CFG[status] ?? STATUS_CFG.OPEN;
                return (
                  <tr key={d.id}
                    style={{ borderBottom: i < disputes.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition:'background 0.15s', cursor:'pointer' }}
                    onClick={() => setSelected(selected?.id === d.id ? null : d)}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding:'14px 18px', color:'#f8fafc', fontSize:'13px', fontWeight:700, fontFamily:'monospace' }}>
                      #{d.id.slice(0,8).toUpperCase()}
                    </td>
                    <td style={{ padding:'14px 18px', color:'rgba(248,250,252,0.7)', fontSize:'12px' }}>
                      {d.product?.brand} {d.product?.model}
                    </td>
                    <td style={{ padding:'14px 18px', color:'rgba(248,250,252,0.6)', fontSize:'12px' }}>
                      {TYPE_LABELS[d.disputeType ?? ''] ?? 'Genel'}
                    </td>
                    <td style={{ padding:'14px 18px', color:'rgba(248,250,252,0.8)', fontSize:'13px', fontWeight:600 }}>
                      {fmt(Number(d.amount))}
                    </td>
                    <td style={{ padding:'14px 18px' }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'100px', fontSize:'11px', fontWeight:700, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding:'14px 18px', color:'rgba(248,250,252,0.4)', fontSize:'12px' }}>
                      {new Date(d.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td style={{ padding:'14px 18px' }}>
                      <div style={{ display:'flex', gap:'6px' }}>
                        {status === 'OPEN' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(d.id, 'IN_REVIEW'); }}
                            style={{ padding:'4px 10px', borderRadius:'6px', background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', color:'#f59e0b', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                            İncele
                          </button>
                        )}
                        {(status === 'IN_REVIEW' || status === 'ESCALATED') && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(d.id, 'RESOLVED'); }}
                            style={{ padding:'4px 10px', borderRadius:'6px', background:'rgba(249,115,22,0.12)', border:'1px solid rgba(249,115,22,0.25)', color:'#F97316', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                            Çöz
                          </button>
                        )}
                        {status !== 'ESCALATED' && status !== 'RESOLVED' && status !== 'REFUNDED' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(d.id, 'ESCALATED'); }}
                            style={{ padding:'4px 10px', borderRadius:'6px', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.2)', color:'#a855f7', fontSize:'11px', fontWeight:700, cursor:'pointer' }}>
                            Eskalasyon
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', padding:'24px', height:'fit-content', position:'sticky', top:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px' }}>
              <div>
                <h3 style={{ color:'#f8fafc', fontSize:'16px', fontWeight:800 }}>#{selected.id.slice(0,8).toUpperCase()}</h3>
                <p style={{ color:'rgba(248,250,252,0.4)', fontSize:'12px', marginTop:'2px' }}>
                  {selected.product?.brand} {selected.product?.model}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'rgba(248,250,252,0.4)', cursor:'pointer', fontSize:'18px' }}>×</button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color:'rgba(248,250,252,0.55)', fontSize:'11px', marginBottom:'4px' }}>Tutar</p>
                  <p style={{ color:'#f8fafc', fontSize:'14px', fontWeight:700 }}>{fmt(Number(selected.amount))}</p>
                </div>
                <div style={{ padding:'12px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color:'rgba(248,250,252,0.55)', fontSize:'11px', marginBottom:'4px' }}>Bayi</p>
                  <p style={{ color:'#f8fafc', fontSize:'12px', fontWeight:600 }}>{selected.seller?.companyName || selected.seller?.name}</p>
                </div>
              </div>

              {selected.disputeNote && (
                <div style={{ padding:'14px', borderRadius:'10px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ color:'rgba(248,250,252,0.4)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Mevcut Not</p>
                  <p style={{ color:'rgba(248,250,252,0.7)', fontSize:'13px', lineHeight:1.6 }}>{selected.disputeNote}</p>
                </div>
              )}

              <div>
                <label style={{ color:'rgba(248,250,252,0.4)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', display:'block', marginBottom:'6px' }}>Admin Notu</label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', height:'80px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#f8fafc', fontSize:'13px', resize:'vertical', outline:'none', boxSizing:'border-box' }}
                  placeholder="Karar notunuzu yazın..."
                />
              </div>

              <div style={{ display:'flex', gap:'8px' }}>
                <button
                  disabled={saving}
                  onClick={() => updateStatus(selected.id, 'RESOLVED', note)}
                  style={{ flex:1, padding:'10px', borderRadius:'10px', border:'none', background:'linear-gradient(135deg, #F97316, #EA580C)', color:'white', fontSize:'13px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', opacity: saving ? 0.6 : 1 }}>
                  <CheckCircle size={14}/> {saving ? 'Kaydediliyor…' : 'Çözüldü İşaretle'}
                </button>
                <button style={{ padding:'10px 14px', borderRadius:'10px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(248,250,252,0.6)', fontSize:'13px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                  <MessageSquare size={14}/> Mesaj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
