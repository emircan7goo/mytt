'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, Mail, RotateCcw, FlaskConical } from 'lucide-react';
import { API_BASE } from '@/lib/apiBase';

type Status = 'idle' | 'loading' | 'success' | 'error';

function EmailDogrulaContent() {
  const searchParams              = useSearchParams();
  const router                    = useRouter();
  const email                     = searchParams.get('email') ?? '';

  const [code, setCode]           = useState(['', '', '', '', '', '']);
  const [status, setStatus]       = useState<Status>('idle');
  const [message, setMessage]     = useState('');
  const [resendTimer, setTimer]   = useState(0);
  const [devMode, setDevMode]     = useState(false); // DEV auto-fill yapıldı mı?
  const inputRefs                 = useRef<(HTMLInputElement | null)[]>([]);

  // Geri sayım (yeniden gönder kısıtı)
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Email yoksa kayıt sayfasına yönlendir
  useEffect(() => {
    if (!email) router.replace('/register');
  }, [email, router]);

  // DEV MODU: Kodu API'den çekip kutucuklara doldur — ASLA otomatik doğrulama yapma!
  useEffect(() => {
    if (!email || process.env.NODE_ENV === 'production') return;
    const fetchDevOtp = async () => {
      try {
        const res  = await fetch(`${API_BASE}/auth/dev-otp?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (data.code && typeof data.code === 'string' && data.code.length === 6) {
          setCode(data.code.split(''));
          setDevMode(true);
          // İlk kutucuğa focus ver — kullanıcı kodu görüp butona bassın
          setTimeout(() => inputRefs.current[5]?.focus(), 100);
        }
      } catch {
        // sessizce geç
      }
    };
    const t = setTimeout(fetchDevOtp, 600);
    return () => clearTimeout(t);
  }, [email]); // ⚠️ fullCode dependency YOK — auto-verify tetiklenmesin

  const fullCode = code.join('');

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    setDevMode(false); // Kullanıcı manuel yazmaya başladı
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste.length === 6) {
      setCode(paste.split(''));
      setDevMode(false);
      setTimeout(() => inputRefs.current[5]?.focus(), 50);
    }
    e.preventDefault();
  };

  const handleVerify = async () => {
    const currentCode = code.join('');
    if (currentCode.length < 6) {
      setStatus('error');
      setMessage('Lütfen 6 haneli kodu eksiksiz girin.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res  = await fetch(`${API_BASE}/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, code: currentCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message ?? 'E-posta adresiniz başarıyla doğrulandı!');
      } else {
        setStatus('error');
        setMessage(data.message ?? 'Kod hatalı veya süresi dolmuş.');
        setCode(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch {
      setStatus('error');
      setMessage('Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setTimer(60);
    setStatus('idle');
    setMessage('');
    setCode(['', '', '', '', '', '']);
    setDevMode(false);
    try {
      await fetch(`${API_BASE}/auth/resend-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      // DEV modunda yeni kodu çek
      if (process.env.NODE_ENV !== 'production') {
        setTimeout(async () => {
          try {
            const r  = await fetch(`${API_BASE}/auth/dev-otp?email=${encodeURIComponent(email)}`);
            const d  = await r.json();
            if (d.code?.length === 6) { setCode(d.code.split('')); setDevMode(true); }
          } catch { /**/ }
        }, 1000);
      }
    } catch { /**/ }
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-black tracking-tight text-zinc-900">
              my<span className="text-violet-500">tt</span>
            </span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">

          {status === 'success' ? (
            /* ── Başarı ─────────────────────────────────────────────────── */
            <div className="text-center">
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={36} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-2">E-posta Doğrulandı!</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">{message}</p>
              <Link
                href="/login"
                className="block w-full py-3.5 rounded-xl font-bold text-sm bg-violet-500 hover:bg-violet-600 text-white transition-colors text-center shadow-violet-500/20 shadow-lg"
              >
                Giriş Yap
              </Link>
            </div>
          ) : (
            /* ── Kod Giriş Formu ─────────────────────────────────────────── */
            <>
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 flex items-center justify-center">
                  <Mail className="text-violet-500" size={28} />
                </div>
              </div>

              <h2 className="text-xl font-bold text-zinc-900 mb-2 text-center">
                Doğrulama Kodunu Girin
              </h2>
              <p className="text-zinc-500 text-[13px] leading-relaxed mb-1 text-center">
                <strong className="text-zinc-700 break-all">{email}</strong>
              </p>
              <p className="text-zinc-400 text-xs mb-5 text-center">
                adresine 6 haneli kod gönderdik
              </p>

              {/* DEV Modu Bandı */}
              {devMode && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
                  <FlaskConical size={14} className="text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700 leading-snug">
                    <strong>Dev modu:</strong> Kod otomatik dolduruldu.
                    Butona basarak doğrulayın.
                  </p>
                </div>
              )}

              {/* 6 Kutulu OTP Giriş */}
              <div className="flex justify-center gap-2 mb-5" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    autoFocus={i === 0 && !devMode}
                    className={[
                      'w-11 h-14 text-center text-2xl font-black rounded-xl border-2 transition-all outline-none',
                      digit
                        ? 'border-violet-400 bg-violet-50 text-zinc-900'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-400',
                      status === 'error'
                        ? '!border-red-400 !bg-red-50'
                        : '',
                      'focus:border-violet-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(249,115,22,0.15)]',
                    ].join(' ')}
                  />
                ))}
              </div>

              {/* Hata mesajı */}
              {status === 'error' && message && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 mb-4 text-center">
                  {message}
                </div>
              )}

              {/* Doğrula Butonu */}
              <button
                onClick={handleVerify}
                disabled={status === 'loading' || fullCode.length < 6}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-violet-500 hover:bg-violet-600 text-white transition-colors shadow-violet-500/20 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
              >
                {status === 'loading' ? (
                  <><Loader2 size={18} className="animate-spin" /> Doğrulanıyor...</>
                ) : (
                  'Kodu Doğrula'
                )}
              </button>

              {/* Yeniden Gönder */}
              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-violet-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw size={13} />
                  {resendTimer > 0 ? `Yeniden gönder (${resendTimer}s)` : 'Yeni kod gönder'}
                </button>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 text-center">
                <Link href="/register" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                  ← Kayıt sayfasına dön
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmailDogrulaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-violet-400" />
      </div>
    }>
      <EmailDogrulaContent />
    </Suspense>
  );
}
