'use client';
import type { Metadata } from 'next';
import DealerSidebar from '@/components/dashboard/DealerSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import RequireRole from '@/components/auth/RequireRole';

// Not: 'use client' ile metadata export birlikte kullanılamaz.
// Metadata için üst layout veya ayrı metadata.ts dosyası kullanılabilir.

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="dealer">
      <div style={{
        display: 'flex', minHeight: '100vh',
        background: 'linear-gradient(135deg, #080b14 0%, #0c1018 60%, #080b14 100%)',
        fontFamily: 'var(--font-inter, system-ui, sans-serif)',
        color: '#f8fafc',
      }}>
        <DealerSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <DashboardTopbar title="Bayi Paneli" subtitle="Satış & Finans Merkezi" />
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
