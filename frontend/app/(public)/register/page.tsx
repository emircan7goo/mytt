'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/apiBase';

export default function RegisterPage() {
  const router                  = useRouter();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      toast.error('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : (data.message ?? 'Kayıt işlemi başarısız.');
        throw new Error(msg);
      }

      // Kayıt başarılı — OTP doğrulama sayfasına yönlendir
      router.push(`/email-dogrula?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sunucuya bağlanılamadı.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--k-canvas)]">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight text-[var(--k-ink)]">
              my<span className="text-[var(--k-hot)]">tt</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-[var(--k-ink-3)] font-medium">
            Yeni hesap oluşturun
          </p>
        </div>


        <div className="bg-[var(--k-surface)] rounded-2xl shadow-sm border border-[var(--k-line)] overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Ad Soyad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-widest pl-1">
                  Ad Soyad
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] group-focus-within:text-[var(--k-hot)] transition-colors"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ali Demir"
                    className="w-full bg-[var(--k-surface)] border border-[var(--k-line-2)] rounded-xl py-3 pl-11 pr-4 text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-widest pl-1">
                  E-Posta
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] group-focus-within:text-[var(--k-hot)] transition-colors"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@hesap.com"
                    className="w-full bg-[var(--k-surface)] border border-[var(--k-line-2)] rounded-xl py-3 pl-11 pr-4 text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-widest pl-1">
                  Şifre
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] group-focus-within:text-[var(--k-hot)] transition-colors"
                    size={18}
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    className="w-full bg-[var(--k-surface)] border border-[var(--k-line-2)] rounded-xl py-3 pl-11 pr-11 text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Şifre Tekrar */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-widest pl-1">
                  Şifre Tekrar
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] group-focus-within:text-[var(--k-hot)] transition-colors"
                    size={18}
                  />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full bg-[var(--k-surface)] border border-[var(--k-line-2)] rounded-xl py-3 pl-11 pr-4 text-[var(--k-ink)] placeholder-[var(--k-ink-4)] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[15px] bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/20 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Hesap Oluştur
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-[var(--k-surface-2)] border-t border-[var(--k-line)] flex flex-col gap-2 text-center">
            <p className="text-sm text-[var(--k-ink-3)]">
              Zaten hesabınız var mı?{' '}
              <Link
                href="/login"
                className="font-bold text-[var(--k-hot)] hover:text-orange-600 transition-colors"
              >
                Giriş Yap
              </Link>
            </p>
            <Link
              href="/register-dealer"
              className="text-[12px] text-[var(--k-ink-4)] hover:text-sky-600 transition-colors font-medium"
            >
              Esnaf mısınız? Bayi başvurusu için tıklayın →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
