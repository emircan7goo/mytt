'use client';
// Not: 'use client' ile metadata export birlikte kullanılamaz.
// Sayfa başlıkları için her sayfanın kendi metadata.ts / generateMetadata kullanılabilir.
import CustomerSidebar from '@/components/dashboard/CustomerSidebar';
import CustomerTopbar from '@/components/dashboard/CustomerTopbar';
import RequireRole from '@/components/auth/RequireRole';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="customer">
      <div style={{
        display: 'flex', minHeight: '100vh',
        // KARBON: müşteri hesabı vitrinin devamı sayılır, bu yüzden aynı koyu
        // kanvası kullanır. (admin/bayi panelleri kendi kimliklerini korur.)
        background: 'var(--k-canvas)',
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        color: 'var(--k-ink-2)',
      }}>
        <CustomerSidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <CustomerTopbar />
          <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
