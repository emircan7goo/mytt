'use client';
import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { toast } from 'sonner';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">Email Gönderildi</h2>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">
            <strong>{email}</strong> adresine sıfırlama bağlantısı gönderdik.
            Gelen kutunuzu ve spam klasörünüzü kontrol edin.
          </p>
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-900 hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Girişe Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-100 shadow-sm p-10">
        <Link
          href="/login"
          className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Girişe Dön
        </Link>

        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <Mail size={22} className="text-blue-600" />
        </div>

        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Şifremi Unuttum</h1>
        <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
          Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantısını gönderelim.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              E-posta Adresi
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              className="border border-zinc-200 focus:border-blue-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="bg-zinc-900 hover:bg-black text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Gönderiliyor...</>
            ) : (
              'Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
