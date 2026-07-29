'use client';

/**
 * EmailVerifyBanner — E-posta doğrulama ARTIK ZORUNLU DEĞİL. Giriş yapmış ama
 * e-postasını doğrulamamış kullanıcıya ince, kapatılabilir bir hatırlatma şeridi
 * gösterir. Doğrulama tamamen opsiyoneldir; kimse hesabına kilitlenmez.
 *
 * Tema-uyumlu: yalnızca --k-* tokenları kullanır (açık ve koyu temada çalışır).
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MailWarning, X, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/providers/AppProvider';
import { API_BASE } from '@/lib/apiBase';

const DISMISS_KEY = 'mytt-verify-banner-dismissed';

export default function EmailVerifyBanner() {
  const { user } = useApp();
  const [dismissed, setDismissed] = useState(true); // SSR'da gizli başla — FOUC yok
  const [sending, setSending]     = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  // Sadece giriş yapmış VE doğrulanmamış kullanıcıya göster
  if (!user || user.emailVerified !== false || dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const resend = async () => {
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/auth/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) throw new Error();
      toast.success('Doğrulama kodu e-posta adresinize gönderildi.');
    } catch {
      toast.error('Kod gönderilemedi. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm border-b"
      style={{
        background: 'var(--k-hot-wash)',
        borderColor: 'var(--k-line-hot)',
        color: 'var(--k-ink)',
      }}
    >
      <MailWarning size={17} className="shrink-0 text-[var(--k-hot)]" />
      <span className="flex-1 font-medium leading-snug">
        E-posta adresin henüz doğrulanmadı.{' '}
        <span className="text-[var(--k-ink-3)] hidden sm:inline">
          Hesabını daha güvenli hale getirmek için doğrulayabilirsin (isteğe bağlı).
        </span>
      </span>

      <button
        onClick={resend}
        disabled={sending}
        className="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-[13px] font-bold text-[var(--k-ink-2)] hover:text-[var(--k-hot)] transition-colors disabled:opacity-60"
      >
        <Send size={13} />
        {sending ? 'Gönderiliyor…' : 'Kodu Gönder'}
      </button>

      <Link
        href={`/email-dogrula?email=${encodeURIComponent(user.email)}`}
        className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-[13px] font-black bg-[var(--k-hot)] text-[var(--k-hot-ink)] hover:bg-[var(--k-hot-deep)] transition-colors"
      >
        Doğrula
      </Link>

      <button
        onClick={dismiss}
        aria-label="Kapat"
        className="shrink-0 p-1.5 rounded-full text-[var(--k-ink-4)] hover:text-[var(--k-ink-2)] hover:bg-[var(--k-surface-3)] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
