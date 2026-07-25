'use client';
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Package, ShieldCheck, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function BasariliContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const orderId      = searchParams.get('orderId');
  const isTestMode   = searchParams.get('testMode') === '1';

  // 10 saniye sonra hesabıma yönlendir
  useEffect(() => {
    const t = setTimeout(() => router.push('/hesabim'), 10000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex flex-col items-center gap-6 max-w-md text-center"
      >
        {/* İkon */}
        <div className="w-28 h-28 rounded-full bg-violet-50 border-2 border-violet-200 flex items-center justify-center shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <CheckCircle2 size={52} className="text-violet-500" strokeWidth={1.5} />
        </div>

        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-2">
            Ödeme Onaylandı
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Siparişiniz alındı ve güvence altına alındı. Bayi onayladıktan sonra
            kargoya verilecek ve size bildirim yapılacaktır.
          </p>
        </div>

        {/* Test modu uyarısı — gerçek ödeme henüz bağlı değil */}
        {isTestMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 w-full text-left flex gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-0.5">Test Modu — Gerçek Ödeme Alınmadı</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Ödeme altyapımız yakında devreye alınacak. Bu sipariş test amaçlı oluşturuldu,
                kartınızdan herhangi bir tutar çekilmedi.
              </p>
            </div>
          </div>
        )}

        {/* Sipariş ID */}
        {orderId && (
          <div className="bg-white border border-zinc-100 rounded-2xl px-6 py-4 w-full shadow-sm">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Sipariş No</p>
            <p className="font-mono text-zinc-800 text-sm">{orderId.slice(0, 8).toUpperCase()}</p>
          </div>
        )}

        {/* Alışveriş güvencesi */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 w-full text-left flex gap-3">
          <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800 mb-0.5">Alışveriş Güvencesi Aktif</p>
            <p className="text-xs text-blue-600 leading-relaxed">
              Ödemeniz teslim onayına kadar platformumuzda güvende tutulmaktadır.
              Sorun yaşarsanız tam iade garantimiz mevcuttur.
            </p>
          </div>
        </div>

        {/* Sonraki adım */}
        <div className="bg-white border border-zinc-100 rounded-2xl p-4 w-full text-left flex gap-3">
          <Package size={18} className="text-zinc-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-zinc-800 mb-0.5">Sonraki Adım</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Bayi siparişinizi onayladıktan sonra kargoya verilecek.
              Takip numaranız e-posta adresinize gönderilecektir.
            </p>
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/hesabim"
            className="w-full bg-zinc-900 hover:bg-black text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
          >
            Siparişlerime Git <ArrowRight size={16} />
          </Link>
          <Link
            href="/"
            className="w-full border border-zinc-200 hover:border-zinc-400 text-zinc-700 font-semibold py-3.5 rounded-2xl flex items-center justify-center transition-colors text-sm"
          >
            Alışverişe Devam Et
          </Link>
        </div>

        <p className="text-xs text-zinc-400">10 saniye içinde otomatik yönlendirileceksiniz</p>
      </motion.div>
    </div>
  );
}

export default function PaymentBasariliPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <BasariliContent />
    </Suspense>
  );
}
