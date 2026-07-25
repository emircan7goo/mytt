'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUIStore, useAuthStore } from '@/store';
import { X, Lock, Mail, ChevronRight, UserPlus, Store } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api';
import { setSessionCookie } from '@/lib/auth';

export default function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen } = useUIStore();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDealerMode, setIsDealerMode] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      if (data.user) {
        // JWT backend tarafından HttpOnly cookie olarak set edildi.
        // Biz sadece user bilgisini store'a yazıyoruz.
        login(data.user);
        // Companion cookie — proxy.ts (edge RBAC) HttpOnly jwt'yi okuyamıyor
        setSessionCookie(data.user);
        toast.success(`Hoş geldiniz, ${data.user.name || data.user.email}`);

        setTimeout(() => {
          setAuthModalOpen(false);
          const role = data.user.role as string;
          if (role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (role === 'dealer') {
            window.location.href = '/dealer/dashboard';
          } else {
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect');
            const isSafeRedirect =
              !!redirect &&
              redirect.startsWith('/') &&
              !redirect.startsWith('//') &&
              !redirect.startsWith('/\\');
            if (isSafeRedirect) {
              window.location.href = redirect!;
            }
          }
        }, 500);
      } else {
        throw new Error('Geçersiz kimlik formatı.');
      }
    } catch (err: unknown) {
      const res   = (err as any)?.response;
      const data  = res?.data;
      const status = res?.status;
      // Önce backend'in Türkçe mesajına bak, yoksa statusa göre mesaj üret
      const msg =
        (typeof data?.message === 'string' ? data.message : null) ??
        (Array.isArray(data?.message) ? data.message.join(', ') : null) ??
        (status === 403 ? 'E-posta adresiniz doğrulanmamış. Gelen kutunuzu kontrol edin.' :
         status === 401 ? 'E-posta veya şifre hatalı.' :
         status === 429 ? 'Çok fazla deneme. Lütfen bir dakika bekleyin.' :
         'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setAuthModalOpen(false)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {isDealerMode ? 'Bayi / Kurumsal Giriş' : 'Merhaba,'}
          </h2>
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isDealerMode ? (
          <div className="p-5 text-sm text-sky-700 bg-sky-50 border-b border-sky-100 font-medium">
            Sadece onaylı mağaza yetkilileri giriş yapabilir.
          </div>
        ) : (
          <div className="p-5 text-sm text-gray-500 font-medium pb-2">
            Mytt'e giriş yap veya hesap oluştur.
          </div>
        )}

        <div className="p-5 pt-3">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-widest pl-1">E-Posta</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@hesap.com"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between pl-1 pr-1">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-widest">Şifre</label>
                <Link
                href="/sifremi-unuttum"
                onClick={() => setAuthModalOpen(false)}
                className="text-[11px] font-bold text-gray-400 hover:text-violet-500 transition-colors"
              >
                Şifremi Unuttum
              </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-500 transition-colors" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-300 rounded-xl py-3 pl-11 pr-11 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group relative mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[15px] transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${isDealerMode ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20' : 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/20'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Giriş Yap
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Register CTAs */}
          <div className="mt-5 pt-4 border-t border-gray-100 space-y-2.5">
            <Link
              href="/register"
              onClick={() => setAuthModalOpen(false)}
              className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus size={16} className="text-violet-500" />
                <span className="text-[13px] font-bold text-gray-700 group-hover:text-violet-700">
                  Hesabın yok mu? <span className="text-violet-600">Üye Ol</span>
                </span>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              href="/register-dealer"
              onClick={() => setAuthModalOpen(false)}
              className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl bg-sky-50 hover:bg-sky-100 border border-sky-200 hover:border-sky-300 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Store size={16} className="text-sky-600" />
                <span className="text-[13px] font-bold text-sky-800">
                  Esnaf mısın? <span className="text-sky-700">Bayi Başvurusu Yap</span>
                </span>
              </div>
              <ChevronRight size={14} className="text-sky-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* The hidden dealer toggle */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button 
            type="button" 
            onClick={() => setIsDealerMode(!isDealerMode)}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
          >
            {isDealerMode ? 'Standart Müşteri Girişine Dön' : 'Esnaf Mısınız? Bayi girişi için tıklayın.'}
          </button>
        </div>
      </div>
    </div>
  );
}
