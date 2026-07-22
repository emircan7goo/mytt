'use client';
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

function BasarisizContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const productId    = searchParams.get('productId');

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex flex-col items-center gap-6 max-w-md text-center"
      >
        {/* İkon */}
        <div className="w-28 h-28 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center shadow-[0_0_60px_rgba(239,68,68,0.1)]">
          <XCircle size={52} className="text-red-400" strokeWidth={1.5} />
        </div>

        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-900 mb-2">
            Ödeme Başarısız
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Ödeme işlemi tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
            Herhangi bir ücret tahsil edilmedi.
          </p>
        </div>

        {/* Olası sebepler */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 w-full text-left">
          <p className="text-sm font-semibold text-amber-800 mb-2">Olası Sebepler</p>
          <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside leading-relaxed">
            <li>Kart bilgileri hatalı girildi</li>
            <li>Kartınızın internet alışverişi kapalı olabilir</li>
            <li>3D Secure şifresi yanlış girildi</li>
            <li>Kartınızda yeterli limit olmayabilir</li>
            <li>Bankanız işlemi reddetti</li>
          </ul>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col gap-3 w-full">
          {productId && (
            <Link
              href={`/checkout?productId=${productId}`}
              className="w-full bg-zinc-900 hover:bg-black text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw size={16} /> Tekrar Dene
            </Link>
          )}
          <button
            onClick={() => router.back()}
            className="w-full border border-zinc-200 hover:border-zinc-400 text-zinc-700 font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Ürüne Dön
          </button>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentBasarisizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <BasarisizContent />
    </Suspense>
  );
}
