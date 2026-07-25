'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token') ?? '';

  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);

  useEffect(() => {
    if (!token) router.replace('/sifremi-unuttum');
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error('Şifre en az 6 karakter olmalı'); return; }
    if (password !== confirm)  { toast.error('Şifreler eşleşmiyor'); return; }

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword: password });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      const d   = err?.response?.data;
      const msg = d?.message ?? d?.error?.message ?? 'Geçersiz veya süresi dolmuş bağlantı';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[var(--k-surface)] rounded-3xl border border-[var(--k-line)] shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--k-ink)] mb-2">Şifre Güncellendi</h2>
          <p className="text-[var(--k-ink-3)] text-sm mb-4">Yeni şifrenizle giriş yapabilirsiniz. Yönlendiriliyorsunuz...</p>
          <Link href="/login" className="text-sm font-semibold text-blue-600 hover:underline">
            Hemen Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--k-surface)] rounded-3xl border border-[var(--k-line)] shadow-sm p-10">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Lock size={22} className="text-blue-600" />
        </div>

        <h1 className="text-2xl font-semibold text-[var(--k-ink)] mb-1">Yeni Şifre Oluştur</h1>
        <p className="text-[var(--k-ink-3)] text-sm mb-8">En az 6 karakter içeren güçlü bir şifre seçin.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider">Yeni Şifre</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
                placeholder="En az 6 karakter"
                className="w-full border border-[var(--k-line)] focus:border-blue-500 rounded-xl px-4 py-3 pr-10 text-sm outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)]"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[var(--k-ink-3)] uppercase tracking-wider">Şifre Tekrar</label>
            <input
              type={showPwd ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Şifrenizi tekrar girin"
              className={`border rounded-xl px-4 py-3 text-sm outline-none transition-colors ${ confirm && confirm !== password ? 'border-red-300 focus:border-red-400' : 'border-[var(--k-line)] focus:border-blue-500' }`}
            />
            {confirm && confirm !== password && (
              <p className="text-xs text-red-500">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password || !confirm}
            className="bg-zinc-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Kaydediliyor...</>
              : 'Şifremi Güncelle'
            }
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[var(--k-ink-4)]" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
