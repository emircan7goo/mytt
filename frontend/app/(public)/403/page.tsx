'use client';
import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Animated orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div style={{
          position:'absolute', top:'20%', left:'15%',
          width:'400px', height:'400px',
          background:'radial-gradient(circle, rgba(239,68,68,0.18) 0%, transparent 70%)',
          filter:'blur(80px)', borderRadius:'50%',
          animation:'float-orb 6s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', bottom:'25%', right:'10%',
          width:'350px', height:'350px',
          background:'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          filter:'blur(80px)', borderRadius:'50%',
          animation:'float-orb 8s ease-in-out infinite alternate-reverse',
        }} />
      </div>

      <style>{`
        @keyframes float-orb { from { transform: translateY(0) scale(1); } to { transform: translateY(-30px) scale(1.05); } }
        @keyframes pulse-icon { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(239,68,68,0.5)); } 50% { transform: scale(1.08); filter: drop-shadow(0 0 40px rgba(239,68,68,0.8)); } }
        @keyframes scan-line { 0% { top: 0; } 100% { top: 100%; } }
      `}</style>

      <div className="relative z-10 text-center max-w-lg mx-auto px-8">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div style={{
            width: '120px', height: '120px',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse-icon 2.5s ease-in-out infinite',
            backdropFilter: 'blur(20px)',
          }}>
            <ShieldX size={56} color="#ef4444" />
          </div>
        </div>

        {/* Error code */}
        <div style={{
          fontSize: '96px', fontWeight: 900, lineHeight: 1,
          background: 'linear-gradient(135deg, #ef4444, #F97316)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '16px', letterSpacing: '-4px',
        }}>403</div>

        <h1 style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
          Erişim Reddedildi
        </h1>
        <p style={{ color: 'rgba(248,250,252,0.5)', fontSize: '15px', lineHeight: 1.7, marginBottom: '40px' }}>
          Bu alana erişim yetkiniz bulunmuyor. Farklı bir rolle giriş yapmayı deneyin ya da ana sayfaya dönün.
        </p>

        {/* Separator */}
        <div style={{
          width: '100%', height: '1px', marginBottom: '40px',
          background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)',
        }} />

        {/* Actions */}
        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => router.back()} style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'12px 24px', borderRadius:'12px',
            background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
            color:'rgba(248,250,252,0.8)', fontSize:'14px', fontWeight:600,
            cursor:'pointer', transition:'all 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background='rgba(255,255,255,0.06)')}
          >
            <ArrowLeft size={16} /> Geri Dön
          </button>
          <button onClick={() => router.push('/')} style={{
            display:'flex', alignItems:'center', gap:'8px',
            padding:'12px 24px', borderRadius:'12px',
            background:'linear-gradient(135deg, #ef4444, #dc2626)',
            border:'none', color:'white', fontSize:'14px', fontWeight:600,
            cursor:'pointer', transition:'all 0.2s',
            boxShadow:'0 8px 24px rgba(239,68,68,0.35)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 12px 32px rgba(239,68,68,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(239,68,68,0.35)'; }}
          >
            <Home size={16} /> Ana Sayfaya Dön
          </button>
        </div>

        {/* Bottom badge */}
        <div style={{
          marginTop: '48px',
          display:'inline-flex', alignItems:'center', gap:'8px',
          padding:'6px 16px', borderRadius:'100px',
          background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)',
        }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse-icon 1.5s infinite' }} />
          <span style={{ color:'rgba(248,250,252,0.5)', fontSize:'12px', fontFamily:'monospace' }}>
            MYTT SECURITY — ACCESS DENIED
          </span>
        </div>
      </div>
    </div>
  );
}
