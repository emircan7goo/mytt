'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Building2, Hash, ChevronRight, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE } from '@/lib/apiBase';

export default function RegisterDealerPage() {
  const router = useRouter();

  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId]             = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [loading, setLoading]         = useState(false);
  const [submitted, setSubmitted]     = useState(false);

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
    if (!/^[0-9]+$/.test(taxId) || taxId.length < 10) {
      toast.error('Vergi numarası en az 10 rakamdan oluşmalıdır.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register-dealer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, taxId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message ?? 'Başvuru gönderilemedi.');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sunucuya bağlanılamadı.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Başvuru başarıyla alındı ekranı
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="w-full max-w-[420px] text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 mb-3">
            Başvurunuz Alındı!
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed mb-6">
            Bayi başvurunuz admin ekibimize iletildi. Onay süreci genellikle{' '}
            <span className="font-bold text-zinc-700">1–2 iş günü</span> sürmektedir.
            Onaylandığında e-posta ile bilgilendirileceksiniz.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-xl transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[480px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight text-zinc-900">
              my<span className="text-violet-500">tt</span>
            </span>
          </Link>
          <p className="mt-2 text-sm text-zinc-500 font-medium">
            Bayi / Kurumsal Başvurusu
          </p>
        </div>

        {/* Bilgi Bandı */}
        <div className="mb-4 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-sky-700 text-sm font-medium">
          Başvurunuz admin onayına gönderilir. Onay sonrası mağazanızı açabilirsiniz.
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Ad Soyad */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  Yetkili Ad Soyad
                </label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmet Yılmaz"
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Şirket Adı */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  Şirket / Mağaza Adı
                </label>
                <div className="relative group">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Yıldız Telekomünikasyon A.Ş."
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Vergi No */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  Vergi Numarası
                </label>
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567890"
                    maxLength={11}
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm tracking-widest"
                  />
                </div>
              </div>

              {/* E-posta */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  E-Posta
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ahmet@firma.com"
                    className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                    Şifre
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-10 pr-9 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">
                    Tekrar
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-sky-500 transition-colors" size={16} />
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••"
                      className="w-full bg-white border border-zinc-300 rounded-xl py-3 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative mt-2 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-[15px] bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Başvuruyu Gönder
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 text-center">
            <p className="text-sm text-zinc-500">
              Bireysel hesap mı açmak istiyorsunuz?{' '}
              <Link
                href="/register"
                className="font-bold text-violet-500 hover:text-violet-600 transition-colors"
              >
                Üye Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
