'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Store, RefreshCw, Hash, Building2, Mail } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';

interface PendingDealer {
  id: string;
  email: string;
  name: string;
  companyName: string;
  taxId: string;
  createdAt: string;
  role: string;
}

export default function AdminDealerApprovalsPage() {
  const [applications, setApplications] = useState<PendingDealer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.get('/admin/dealer-applications');
      const mappedData = (data as Array<Record<string, unknown>>).map((item) => ({
        id: item.id as string,
        email: (item.user as { email: string }).email,
        name: (item.user as { name: string }).name,
        companyName: item.companyName as string,
        taxId: item.taxNumber as string,
        createdAt: item.createdAt as string,
        role: 'CUSTOMER',
      }));
      setApplications(mappedData);
    } catch {
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id: string, email: string) => {
    setProcessingId(id);
    try {
      await apiClient.patch(`/admin/dealer-applications/${id}`, { status: 'APPROVED' });
      toast.success(`✅ ${email} — Bayi olarak onaylandı!`);
      fetchApplications();
    } catch {
      toast.error('Onay işlemi başarısız.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, email: string) => {
    setProcessingId(id);
    try {
      await apiClient.patch(`/admin/dealer-applications/${id}`, { status: 'REJECTED' });
      toast.error(`🗑️ ${email} — Başvuru reddedildi.`);
      fetchApplications();
    } catch {
      toast.error('Red işlemi başarısız.');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 text-[28px] font-bold tracking-tight">
            Bayi Onay Merkezi
          </h2>
          <p className="text-zinc-500 text-[12px] uppercase tracking-widest font-bold mt-1">
            {applications.length} Başvuru Bekliyor
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="flex items-center gap-2 border border-zinc-700 bg-white/[0.04] text-zinc-400 font-bold uppercase tracking-widest text-[11px] px-4 py-2.5 rounded-full hover:border-zinc-500 hover:text-zinc-200 transition-all"
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-16 flex flex-col items-center text-center">
          <CheckCircle2 size={48} className="text-violet-500 mb-4" />
          <h3 className="text-zinc-100 text-xl font-bold">Tüm Başvurular İşlendi</h3>
          <p className="text-zinc-500 text-[13px] mt-2">Bekleyen bayi başvurusu bulunmuyor.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {applications.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-[24px] p-6 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                        <Store size={18} className="text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-zinc-100 font-black text-[16px] tracking-tight">{app.name}</p>
                        <p className="text-zinc-500 text-[12px] font-bold uppercase tracking-wider">{app.role} → Bayi Adayı</p>
                      </div>
                      <span className="ml-2 flex items-center gap-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                        <Clock size={10} /> Beklemede
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                      <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                        <Mail size={12} className="text-zinc-400 flex-shrink-0" />
                        <span className="truncate">{app.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                        <Building2 size={12} className="text-zinc-400 flex-shrink-0" />
                        <span className="truncate font-bold text-zinc-300">{app.companyName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                        <Hash size={12} className="text-zinc-400 flex-shrink-0" />
                        <span className="font-mono tracking-widest">{app.taxId}</span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                      Başvuru: {formatDate(app.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleReject(app.id, app.email)}
                      disabled={processingId === app.id}
                      className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-bold uppercase tracking-widest text-[11px] px-5 py-3 rounded-full transition-all disabled:opacity-40"
                    >
                      <XCircle size={14} /> Reddet
                    </button>
                    <button
                      id={`approve-dealer-${app.id}`}
                      onClick={() => handleApprove(app.id, app.email)}
                      disabled={processingId === app.id}
                      className="flex items-center gap-2 bg-violet-500 text-white font-black uppercase tracking-widest text-[12px] px-6 py-3 rounded-full shadow-md hover:bg-violet-400 transition-all disabled:opacity-50"
                    >
                      {processingId === app.id ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                      Onayla → Bayi
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info box */}
      <div className="bg-sky-500/[0.05] border border-sky-500/20 rounded-[20px] p-5 text-zinc-400 text-[12px] leading-relaxed">
        <strong className="text-zinc-200">ℹ️ Onay Süreci:</strong> &quot;Onayla&quot; butonuna tıklandığında kullanıcının rolü
        <span className="text-zinc-200 font-bold mx-1">CUSTOMER → DEALER</span> olarak güncellenir ve toptan fiyatlandırma paneli aktif hale gelir.
      </div>
    </div>
  );
}
