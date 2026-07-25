'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, Banknote, RefreshCw,
  Building2, Mail, Landmark, ArrowDownToLine,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAdminPayouts, useAdminApprovePayout, useAdminMarkPaidPayout, useAdminRejectPayout,
  type PayoutStatus,
} from '@/lib/hooks/usePayout';

const fmt = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_TABS: { value: PayoutStatus | undefined; label: string }[] = [
  { value: 'PENDING',  label: 'Bekleyen' },
  { value: 'APPROVED', label: 'Onaylı — Havale Bekliyor' },
  { value: 'PAID',     label: 'Ödendi' },
  { value: 'REJECTED', label: 'Reddedildi' },
  { value: undefined,  label: 'Tümü' },
];

export default function AdminPayoutsPage() {
  const [tab, setTab] = useState<PayoutStatus | undefined>('PENDING');
  const { data: payouts = [], isLoading, refetch } = useAdminPayouts(tab);
  const approve  = useAdminApprovePayout();
  const markPaid = useAdminMarkPaidPayout();
  const reject   = useAdminRejectPayout();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    try {
      await approve.mutateAsync(id);
      toast.success('Talep onaylandı — havale yapılınca "Ödendi" işaretleyin.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'İşlem başarısız.');
    } finally { setBusyId(null); }
  };

  const handleMarkPaid = async (id: string) => {
    setBusyId(id);
    try {
      await markPaid.mutateAsync({ id });
      toast.success('Ödendi olarak işaretlendi.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'İşlem başarısız.');
    } finally { setBusyId(null); }
  };

  const handleReject = async (id: string) => {
    const note = window.prompt('Reddetme gerekçesi (bayiye görünmez, iç not):');
    if (!note?.trim()) return;
    setBusyId(id);
    try {
      await reject.mutateAsync({ id, note: note.trim() });
      toast.error('Talep reddedildi — tutar tekrar çekilebilir bakiyeye döndü.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'İşlem başarısız.');
    } finally { setBusyId(null); }
  };

  const STATUS_BADGE: Record<PayoutStatus, { label: string; color: string; bg: string; border: string }> = {
    PENDING:  { label: 'Onay Bekliyor',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
    APPROVED: { label: 'Havale Bekliyor', color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)', border: 'rgba(14,165,233,0.25)' },
    PAID:     { label: 'Ödendi',          color: '#F97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.25)' },
    REJECTED: { label: 'Reddedildi',      color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)' },
  };

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-zinc-100 text-[28px] font-bold tracking-tight">Hakediş Talepleri</h2>
          <p className="text-zinc-500 text-[12px] uppercase tracking-widest font-bold mt-1">
            {payouts.length} talep — bayilerin banka hesabına yapılacak ödemeler
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 border border-zinc-700 bg-white/[0.04] text-zinc-400 font-bold uppercase tracking-widest text-[11px] px-4 py-2.5 rounded-full hover:border-zinc-500 hover:text-zinc-200 transition-all"
        >
          <RefreshCw size={14} /> Yenile
        </button>
      </div>

      {/* Sekmeler */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_TABS.map((t) => (
          <button
            key={t.label}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wide transition-all border ${
              tab === t.value
                ? 'bg-white/10 text-zinc-100 border-white/20'
                : 'text-zinc-500 border-transparent hover:text-zinc-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-[32px] p-16 flex flex-col items-center text-center">
          <CheckCircle2 size={48} className="text-orange-500 mb-4" />
          <h3 className="text-zinc-100 text-xl font-bold">Bu kategoride talep yok</h3>
          <p className="text-zinc-500 text-[13px] mt-2">Yeni bir hakediş çekim talebi geldiğinde burada görünecek.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {payouts.map((p) => {
              const badge = STATUS_BADGE[p.status];
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-[24px] p-6 hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                          <Banknote size={18} className="text-zinc-300" />
                        </div>
                        <div>
                          <p className="text-zinc-100 font-black text-[16px] tracking-tight">
                            {p.dealer?.companyName ?? p.dealer?.name ?? 'Bayi'}
                          </p>
                          <p className="text-zinc-500 text-[12px] font-bold uppercase tracking-wider">
                            {fmt(p.amount)} — talep tutarı
                          </p>
                        </div>
                        <span
                          className="ml-2 flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest"
                          style={{ color: badge.color, background: badge.bg, border: `1px solid ${badge.border}` }}
                        >
                          <Clock size={10} /> {badge.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                        <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                          <Mail size={12} className="text-zinc-400 flex-shrink-0" />
                          <span className="truncate">{p.dealer?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                          <Landmark size={12} className="text-zinc-400 flex-shrink-0" />
                          <span className="font-mono tracking-wide text-zinc-300">{p.iban}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-[12px]">
                          <Building2 size={12} className="text-zinc-400 flex-shrink-0" />
                          <span className="truncate font-bold text-zinc-300">{p.ibanName ?? '—'}</span>
                        </div>
                      </div>

                      <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold">
                        Talep: {formatDate(p.requestedAt)}
                        {p.processedAt && ` · İşlem: ${formatDate(p.processedAt)}`}
                      </p>
                      {p.adminNote && (
                        <p className="text-zinc-500 text-[11px] italic">Not: {p.adminNote}</p>
                      )}
                    </div>

                    {(p.status === 'PENDING' || p.status === 'APPROVED') && (
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={busyId === p.id}
                          className="flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 font-bold uppercase tracking-widest text-[11px] px-5 py-3 rounded-full transition-all disabled:opacity-40"
                        >
                          <XCircle size={14} /> Reddet
                        </button>
                        {p.status === 'PENDING' ? (
                          <button
                            onClick={() => handleApprove(p.id)}
                            disabled={busyId === p.id}
                            className="flex items-center gap-2 bg-sky-500 text-white font-black uppercase tracking-widest text-[12px] px-6 py-3 rounded-full shadow-md hover:bg-sky-400 transition-all disabled:opacity-50"
                          >
                            {busyId === p.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={14} />}
                            Onayla
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(p.id)}
                            disabled={busyId === p.id}
                            className="flex items-center gap-2 bg-orange-500 text-white font-black uppercase tracking-widest text-[12px] px-6 py-3 rounded-full shadow-md hover:bg-orange-400 transition-all disabled:opacity-50"
                          >
                            {busyId === p.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowDownToLine size={14} />}
                            Havale Yapıldı — Ödendi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <div className="bg-sky-500/[0.05] border border-sky-500/20 rounded-[20px] p-5 text-zinc-400 text-[12px] leading-relaxed">
        <strong className="text-zinc-200">ℹ️ Süreç:</strong> Bayi talep oluşturur →{' '}
        <span className="text-zinc-200 font-bold">Onayla</span> ile kabul edilir → siz IBAN&apos;a elden EFT/havale yaparsınız →{' '}
        <span className="text-zinc-200 font-bold">Havale Yapıldı</span> ile kapatırsınız. Otomatik banka transferi yoktur, para elle gönderilir.
      </div>
    </div>
  );
}
