'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store';
import { ROLE_DASHBOARD, setSessionCookie } from '@/lib/auth';
import type { UserRole } from '@/lib/mock-data';
import apiClient from '@/lib/api';
import { API_BASE } from '@/lib/apiBase';

// useSearchParams Suspense sınırı gerektiriyor
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login } = useAuthStore();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('E-posta ve şifre zorunludur.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });

      // Because of apiClient, the HttpOnly cookie is automatically saved by the browser.
      login(data.user);
      // Companion cookie — proxy.ts (edge RBAC) HttpOnly jwt'yi okuyamıyor
      setSessionCookie(data.user);

      toast.success(`Hoş geldiniz, ${data.user.name}!`);

      const role = data.user.role as UserRole;
      const dashboard = ROLE_DASHBOARD[role] ?? '/';
      const safeRedirect = redirectTo &&
        /^\/[^/]/.test(redirectTo) &&  // starts with / but NOT //
        !redirectTo.startsWith('/login');
      const destination = safeRedirect ? redirectTo : dashboard;

      window.location.href = destination;
      // Fallback if window.location doesn't trigger
      router.push(destination);
    } catch (err: any) {
      const data   = err?.response?.data;
      const status = err?.response?.status;
      const message =
        (typeof data?.message === 'string' ? data.message : null) ??
        (Array.isArray(data?.message) ? data.message.join(', ') : null) ??
        (status === 403 ? 'E-posta adresiniz doğrulanmamış. Gelen kutunuzu kontrol edin.' :
         status === 401 ? 'E-posta veya şifre hatalı.' :
         status === 409 ? 'Bu e-posta adresi zaten kayıtlı.' :
         status === 429 ? 'Çok fazla deneme. Lütfen bir dakika bekleyin.' :
         'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[420px]">

        {/* Logo / Başlık */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight text-zinc-900">
              my<span className="text-violet-500">tt</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-zinc-500 font-medium">
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Kart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">

          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* E-posta */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  E-Posta
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@hesap.com"
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between pl-1 pr-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Şifre
                  </label>
                  <Link
                    href="/sifremi-unuttum"
                    className="text-[11px] font-bold text-zinc-400 hover:text-violet-500 transition-colors"
                  >
                    Şifremi Unuttum
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-violet-500 transition-colors"
                    size={18}
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-11 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium tracking-widest text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Giriş Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="group relative mt-1 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[15px] bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/20 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
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
          </div>

          {/* Alt Bağlantılar */}
          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex flex-col gap-2 text-center">
            <p className="text-sm text-zinc-500">
              Hesabınız yok mu?{' '}
              <Link
                href="/register"
                className="font-bold text-violet-500 hover:text-violet-600 transition-colors"
              >
                Üye Ol
              </Link>
            </p>
            <Link
              href="/register-dealer"
              className="text-[12px] text-zinc-400 hover:text-sky-600 transition-colors font-medium"
            >
              Esnaf mısınız? Bayi başvurusu için tıklayın →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
