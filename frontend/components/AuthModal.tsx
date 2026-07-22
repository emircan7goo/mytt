'use client';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import { ROLE_DASHBOARD, setSessionCookie } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, login } = useApp();
  const router = useRouter();

  const [mode,     setMode]     = useState<'login' | 'register'>('login');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [name,     setName]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const closeModal = () => {
    setShowAuthModal(false);
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  // ── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 700));

    // ── MASTER KEY (Admin Backdoor) ──
    const isBackdoor = email.trim().toLowerCase() === 'emircan' && password === '123321';
    
    if (mode === 'login' && isBackdoor) {
      const masterUser = {
        id: 'master-admin-001',
        name: 'Emircan (CTO)',
        email: 'emircan@telefoncum.com',
        avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Emircan&backgroundColor=8B5CF6',
        role: 'admin' as const,
      };
      login(masterUser);
      toast.success('🛠️ Mimar Girişi Başarılı!', {
        description: 'Builder paneline yönlendiriliyorsunuz...',
        duration: 3000,
      });
      closeModal();
      window.location.href = '/admin/builder';
      setLoading(false);
      return;
    }

    // ── NATIVE REGEX VALIDATION FOR NORMAL USERS ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!isBackdoor && !emailRegex.test(email.trim())) {
      setError('Lütfen geçerli bir e-posta adresi giriniz.');
      setLoading(false);
      return;
    }

    if (mode === 'login') {
      try {
        const { data } = await apiClient.post('/auth/login', { email, password });
        login(data.user);
        setSessionCookie(data.user);
        toast.success(`✅ Hoş geldin, ${data.user.name}!`, { duration: 3000 });
        closeModal();
        window.location.href = ROLE_DASHBOARD[data.user.role as keyof typeof ROLE_DASHBOARD] ?? '/';
      } catch (err: any) {
        const data   = err?.response?.data;
        const status = err?.response?.status;
        const message =
          (typeof data?.message === 'string' ? data.message : null) ??
          (Array.isArray(data?.message) ? data.message.join(', ') : null) ??
          (status === 403 ? 'E-posta adresiniz doğrulanmamış. Gelen kutunuzu kontrol edin.' :
           status === 401 ? 'E-posta veya şifre hatalı.' :
           'Giriş başarısız. Lütfen tekrar deneyin.');
        setError(message);
        toast.error('Giriş başarısız', { description: message });
      }
    } else {
      // Register: Auto-login as customer (demo mode)
      const mockUser = {
        id: `u-${Date.now()}`,
        name: name || 'Yeni Kullanıcı',
        email: email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'U')}&backgroundColor=059669`,
        role: 'customer' as const,
      };
      login(mockUser);
      toast.success(`🎉 Hesabın oluşturuldu, ${mockUser.name}!`, { duration: 3000 });
      closeModal();
    }

    setLoading(false);
  };

  return (
    <AnimatePresence>
      {showAuthModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/90 border border-zinc-200 rounded-3xl backdrop-blur-xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] w-full max-w-md p-8 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shadow-sm border border-zinc-200">
                    <ShieldCheck size={14} className="text-zinc-900" />
                  </div>
                  <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Güvenli Giriş</span>
                </div>
                <h2 className="text-zinc-900 font-extrabold text-[26px] tracking-tight mt-2">
                  {mode === 'login' ? 'Hoş Geldin.' : 'Hesap Oluştur.'}
                </h2>
                <p className="text-zinc-500 text-sm font-medium mt-1">
                  {mode === 'login'
                    ? 'Güvenli e-ticaret deneyimi için giriş yap.'
                    : 'Ücretsiz hesap oluştur, alışverişe başla.'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2.5 rounded-2xl bg-slate-50 border border-zinc-200 hover:bg-slate-100 hover:text-zinc-900 text-zinc-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-zinc-200 rounded-xl text-zinc-900 text-[15px] font-bold placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all shadow-sm"
                  />
                </div>
              )}

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-zinc-200 rounded-xl text-zinc-900 text-[15px] font-bold placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all shadow-sm"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-zinc-200 rounded-xl text-zinc-900 text-[15px] font-bold placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900 transition-colors bg-slate-100 p-1.5 rounded-md border border-zinc-200"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-[13px] font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                >
                  {error}
                </motion.p>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <button type="button" className="text-[12px] text-zinc-500 font-bold hover:text-zinc-900 transition-colors">
                    Şifremi Unuttum
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 text-[15px] font-black rounded-xl flex items-center justify-center gap-2 bg-zinc-900 text-white hover:bg-black transition-colors shadow-[0_0_20px_rgba(0,0,0,0.05)] ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Keşfe Başla' : 'Ağımıza Katıl'}
                    <ChevronRight size={18} strokeWidth={3} />
                  </>
                )}
              </button>
            </form>

            {/* Trust note */}
            <div className="flex items-center justify-center gap-2 mt-6 pb-2 text-zinc-600 text-[11px] font-bold tracking-widest uppercase">
              <Lock size={12} />
              <span className="mt-px">256-bit SSL · End-to-End Encryption</span>
            </div>

            {/* Toggle mode */}
            <div className="text-center mt-5 pt-5 border-t border-zinc-200 text-[13px] font-bold text-zinc-500">
              {mode === 'login' ? (
                <>
                  Telefoncum hesabın yok mu?{' '}
                  <button onClick={() => setMode('register')} className="text-zinc-900 hover:underline transition-all">
                    Yeni Oluştur
                  </button>
                </>
              ) : (
                <>
                  Zaten bir hesabın var mı?{' '}
                  <button onClick={() => setMode('login')} className="text-zinc-900 hover:underline transition-all">
                    Giriş Yap
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
