'use client';
import AdminSidebar from '@/components/dashboard/AdminSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';
import RequireRole from '@/components/auth/RequireRole';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole role="admin">
      <div className="flex min-h-screen font-sans" data-theme="dark" style={{ background: '#0a0d18', color: '#e2e8f0' }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          <DashboardTopbar title="Admin Paneli" subtitle="God Mode" />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </RequireRole>
  );
}
