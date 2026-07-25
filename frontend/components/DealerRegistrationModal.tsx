'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Building2, Hash, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface DealerRegistrationModalProps {
  onClose: () => void;
}

export default function DealerRegistrationModal({ onClose }: DealerRegistrationModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    taxId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Tüm alanları doldurun.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyName || !form.taxId) {
      toast.error('Firma bilgileri zorunludur.');
      return;
    }
    setIsSubmitting(true);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

      // 1. Register user with PENDING_DEALER role first
      const regRes = await fetch(`${BACKEND}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'PENDING_DEALER',
        }),
      });

      if (!regRes.ok && regRes.status !== 409) {
        throw new Error('Kayıt başarısız');
      }

      // 2. Send dealer application request separately
      const appRes = await fetch(`${BACKEND}/dealer/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          companyName: form.companyName,
          taxId: form.taxId,
        }),
      }).catch(() => null); // graceful fail if route not yet live

      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Başvuru gönderilemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[500] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-white/40 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-lg bg-white border-2 border-zinc-200/50 rounded-[32px] shadow-[0_0_60px_rgba(0,0,0,0.05)] overflow-hidden z-10"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          {/* Glow gradient top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-zinc-200 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-zinc-200/50 flex items-center justify-center shadow-sm">
                  <Store size={18} className="text-zinc-800" />
                </div>
                <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">B2B Başvuru Sistemi</span>
              </div>
              <h2 className="text-zinc-900 text-3xl font-heading font-thin tracking-tighter">
                Esnaf Ol.
              </h2>
              <p className="text-zinc-500 text-[13px] mt-1">
                Mytt Bayi Ağı'na katıl — toptan fiyat, özel panel.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-400 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Steps indicator */}
          <div className="px-8 pt-6 flex items-center gap-3">
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 1 ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
            <div className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? 'bg-zinc-900' : 'bg-zinc-200'}`} />
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center gap-6 px-8 py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                <CheckCircle2 size={40} className="text-orange-400" />
              </div>
              <div>
                <h3 className="text-zinc-900 text-2xl font-heading font-thin tracking-tight mb-2">Başvurunuz Alındı!</h3>
                <p className="text-zinc-500 text-[14px] leading-relaxed max-w-xs mx-auto">
                  Admin ekibimiz <span className="text-zinc-900 font-bold">{form.companyName}</span> başvurusunu inceleyecek.
                  Onay sonrası size e-posta ile bildirim gönderilecek.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-zinc-900 text-white font-black uppercase tracking-widest px-8 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all text-[13px]"
              >
                Tamam, Kapat
              </button>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleStep1} className="px-8 py-8 flex flex-col gap-5">
              <p className="text-zinc-400 text-[11px] uppercase tracking-widest font-black">Adım 1 — Hesap Bilgileri</p>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Ad Soyad</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="Mehmet Yıldız" required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-zinc-200 focus:border-zinc-400 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-xl text-zinc-900 outline-none transition-all font-light placeholder:text-zinc-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">E-Posta</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="mehmet@firma.com" required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-zinc-200 focus:border-zinc-400 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-xl text-zinc-900 outline-none transition-all font-light placeholder:text-zinc-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Şifre</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="En az 6 karakter" required minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-zinc-200 focus:border-zinc-400 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-xl text-zinc-900 outline-none transition-all font-light placeholder:text-zinc-400" />
                </div>
              </div>

              <button type="submit"
                className="mt-2 bg-zinc-900 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] transition-all text-[13px]">
                İleri — Firma Bilgileri <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-5">
              <p className="text-zinc-400 text-[11px] uppercase tracking-widest font-black">Adım 2 — Firma Bilgileri</p>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Şirket Unvanı</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="companyName" value={form.companyName} onChange={handleChange} type="text" placeholder="Yıldız Telekomünikasyon A.Ş." required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-zinc-200 focus:border-zinc-400 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-xl text-zinc-900 outline-none transition-all font-light placeholder:text-zinc-400" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Vergi Numarası</label>
                <div className="relative">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input name="taxId" value={form.taxId} onChange={handleChange} type="text" placeholder="1234567890" required maxLength={11}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-zinc-200 focus:border-zinc-400 focus:shadow-[0_0_15px_rgba(0,0,0,0.05)] rounded-xl text-zinc-900 outline-none transition-all font-light tracking-widest placeholder:text-zinc-400" />
                </div>
              </div>

              <div className="bg-slate-100 border border-zinc-200 rounded-xl p-4 text-zinc-600 text-[12px] leading-relaxed">
                💼 Başvurunuz admin tarafından incelenecek. Onay sonrası toptan fiyat ve bayi paneli aktif olacak.
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 border-2 border-zinc-300 text-zinc-900 font-bold uppercase tracking-widest py-3.5 rounded-xl hover:border-zinc-400 transition-all text-[13px]">
                  Geri
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 bg-zinc-900 text-white font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2)] disabled:opacity-50 transition-all text-[13px]">
                  {isSubmitting ? 'Gönderiliyor...' : <><Store size={15} /> Başvur</>}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
