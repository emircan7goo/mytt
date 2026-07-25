'use client';
import { useApp } from '@/providers/AppProvider';
import { LogOut, Bell } from 'lucide-react';

export default function CustomerTopbar() {
  const { user, logout } = useApp();

  return (
    <div style={{
      height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px',
      borderBottom: '1px solid rgba(15,23,42,0.07)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(16px)',
      flexShrink: 0,
    }}>
      <div>
        <span style={{ color: '#0f172a', fontSize: '15px', fontWeight: 700 }}>
          Hoş geldin, {user?.name?.split(' ')[0] || 'Misafir'} 👋
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Bell */}
        <button style={{
          width: 34, height: 34, borderRadius: '9px',
          background: 'rgba(15,23,42,0.05)', border: '1px solid rgba(15,23,42,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(15,23,42,0.5)', position: 'relative',
        }}>
          <Bell size={14} />
          <div style={{ position: 'absolute', top: '7px', right: '7px', width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
        </button>

        {/* Avatar + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 10px 5px 5px', borderRadius: '10px', background: 'rgba(15,23,42,0.04)', border: '1px solid rgba(15,23,42,0.07)' }}>
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt={user.name} style={{ width: 26, height: 26, borderRadius: '7px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: '7px', background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 700 }}>
              {user?.name?.charAt(0)}
            </div>
          )}
          <span style={{ color: '#0f172a', fontSize: '13px', fontWeight: 600 }}>{user?.name}</span>
          <button id="customer-logout" onClick={logout} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(15,23,42,0.35)', display: 'flex', alignItems: 'center',
            padding: '0 2px', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(15,23,42,0.35)'}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
