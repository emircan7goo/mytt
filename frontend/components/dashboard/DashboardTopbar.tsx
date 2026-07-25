'use client';
import { useApp } from '@/providers/AppProvider';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DashboardTopbarProps {
  title:    string;
  subtitle?: string;
}

export default function DashboardTopbar({ title, subtitle }: DashboardTopbarProps) {
  const { user, logout } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  const roleColor = user?.role === 'admin' ? '#a855f7' : user?.role === 'dealer' ? '#0ea5e9' : '#8B5CF6';
  const roleName  = user?.role === 'admin' ? 'Admin' : user?.role === 'dealer' ? 'Bayi' : 'Müşteri';

  return (
    <div style={{
      height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(0,0,0,0.15)',
      backdropFilter: 'blur(20px)',
      flexShrink: 0,
    }}>
      {/* Left: page title */}
      <div>
        <h1 style={{ color: '#f8fafc', fontSize: '17px', fontWeight: 700, lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ color: 'rgba(248,250,252,0.4)', fontSize: '12px', marginTop: '1px' }}>{subtitle}</p>}
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Bell */}
        <button style={{
          width: 36, height: 36, borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(248,250,252,0.5)', position: 'relative',
        }}>
          <Bell size={15} />
          <div style={{
            position: 'absolute', top: '6px', right: '6px', width: '7px', height: '7px',
            background: roleColor, borderRadius: '50%',
            boxShadow: `0 0 6px ${roleColor}`,
          }} />
        </button>

        {/* User dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            id="user-menu-btn"
            onClick={() => setShowMenu(s => !s)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '6px 12px 6px 6px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
          >
            {user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt={user.name} style={{ width:28, height:28, borderRadius:'8px', objectFit:'cover', flexShrink:0 }} />
            ) : (
              <div style={{ width:28, height:28, borderRadius:'8px', background:roleColor, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'12px', fontWeight:700 }}>
                {user?.name?.charAt(0)}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#f8fafc', fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{user?.name}</div>
              <div style={{ color: roleColor, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{roleName}</div>
            </div>
            <ChevronDown size={14} color="rgba(248,250,252,0.4)" style={{ flexShrink:0, transition:'transform 0.2s', transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
              background: 'rgba(15,15,25,0.97)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px', padding: '6px', minWidth: '160px',
              backdropFilter: 'blur(30px)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
              <button
                id="logout-btn"
                onClick={() => { setShowMenu(false); logout(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 14px', borderRadius: '10px', border: 'none',
                  background: 'transparent', cursor: 'pointer', color: '#f87171',
                  fontSize: '13px', fontWeight: 600, transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}
              >
                <LogOut size={14} />
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
