'use client';
import { ArrowDownToLine, Clock, CheckCircle } from 'lucide-react';

interface EscrowCardProps {
  pending:          number;
  withdrawable:     number;
  lastPayout:       number;
  lastPayoutDate:   string;
  onWithdraw?:      () => void;
}

const fmt = (n: number) => new Intl.NumberFormat('tr-TR', { style:'currency', currency:'TRY', maximumFractionDigits:0 }).format(n);

export default function EscrowCard({ pending, withdrawable, lastPayout, lastPayoutDate, onWithdraw }: EscrowCardProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a1a12 0%, #0d2318 60%, #0a1a12 100%)',
      border: '1px solid rgba(0,208,132,0.2)',
      borderRadius: '20px',
      padding: '28px 32px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,208,132,0.08)',
    }}>
      {/* Animated neon border glow */}
      <div style={{
        position:'absolute', inset:0, borderRadius:'20px',
        background:'radial-gradient(ellipse at 30% 20%, rgba(0,208,132,0.07) 0%, transparent 60%)',
        pointerEvents:'none',
      }} />

      {/* Corner accent */}
      <div style={{
        position:'absolute', top:0, right:0, width:'200px', height:'200px',
        background:'radial-gradient(circle at top right, rgba(0,208,132,0.12) 0%, transparent 60%)',
        pointerEvents:'none',
      }} />

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
        <div>
          <p style={{ color:'rgba(0,208,132,0.7)', fontSize:'11px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px' }}>
            Güvenli Ödeme Merkezi
          </p>
          <h3 style={{ color:'#f8fafc', fontSize:'16px', fontWeight:700 }}>Hak Edişlerim</h3>
        </div>
        <div style={{
          width:42, height:42, borderRadius:'12px',
          background:'rgba(0,208,132,0.12)', border:'1px solid rgba(0,208,132,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <ArrowDownToLine size={20} color="#00D084" />
        </div>
      </div>

      {/* Two balance columns */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'24px' }}>
        {/* Pending */}
        <div style={{
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)',
          borderRadius:'14px', padding:'16px 18px',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
            <Clock size={13} color="rgba(248,250,252,0.4)" />
            <span style={{ color:'rgba(248,250,252,0.4)', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Bekleyen Hak Ediş
            </span>
          </div>
          <div style={{ fontSize:'24px', fontWeight:800, color:'rgba(248,250,252,0.7)', letterSpacing:'-0.5px' }}>
            {fmt(pending)}
          </div>
          <div style={{ marginTop:'6px', fontSize:'11px', color:'rgba(248,250,252,0.3)' }}>
            Teslimata kadar güvencede
          </div>
        </div>

        {/* Withdrawable */}
        <div style={{
          background:'rgba(0,208,132,0.06)', border:'1px solid rgba(0,208,132,0.2)',
          borderRadius:'14px', padding:'16px 18px',
          boxShadow:'inset 0 0 30px rgba(0,208,132,0.04)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
            <CheckCircle size={13} color="#00D084" />
            <span style={{ color:'rgba(0,208,132,0.8)', fontSize:'11px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Çekilebilir
            </span>
          </div>
          <div style={{ fontSize:'24px', fontWeight:800, letterSpacing:'-0.5px',
            background:'linear-gradient(135deg, #00D084, #00a86b)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          }}>
            {fmt(withdrawable)}
          </div>
          <div style={{ marginTop:'6px', fontSize:'11px', color:'rgba(0,208,132,0.5)' }}>
            Anında transfer
          </div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height:'1px', background:'linear-gradient(90deg, transparent, rgba(0,208,132,0.15), transparent)', marginBottom:'20px' }} />

      {/* Last payout info */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <span style={{ color:'rgba(248,250,252,0.35)', fontSize:'12px' }}>
          Son Ödeme: <strong style={{ color:'rgba(248,250,252,0.6)' }}>{fmt(lastPayout)}</strong>
          <span style={{ marginLeft:'6px', fontSize:'11px' }}>{lastPayoutDate}</span>
        </span>
        <div style={{ width:6, height:6, borderRadius:'50%', background:'#00D084', boxShadow:'0 0 8px #00D084' }} />
      </div>

      {/* Withdraw button */}
      <button
        id="withdraw-btn"
        onClick={onWithdraw}
        style={{
          width:'100%', padding:'14px', borderRadius:'12px',
          background:'linear-gradient(135deg, #00D084, #00a86b)',
          border:'none', color:'#001a0d', fontSize:'14px', fontWeight:800,
          cursor:'pointer', transition:'all 0.25s',
          boxShadow:'0 8px 24px rgba(0,208,132,0.3)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
          letterSpacing:'0.02em',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(0,208,132,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,208,132,0.3)'; }}
      >
        <ArrowDownToLine size={16} />
        Bakiyeyi Çek — {fmt(withdrawable)}
      </button>
    </div>
  );
}
