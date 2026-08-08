'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#090D16] border-t border-slate-800/80 py-6 mt-8">
      <div className="max-w-[1280px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tracking-tighter text-white">
            m<span className="text-orange-500">y</span>tt
          </span>
          <span className="text-slate-600">|</span>
          <span>© 2026 Mytt Teknoloji A.Ş. Tüm hakları saklıdır.</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center text-[11px]">
          <Link href="/kvkk" className="hover:text-white transition-colors">KVKK</Link>
          <Link href="/kullanim-kosullari" className="hover:text-white transition-colors">Kullanım Koşulları</Link>
          <Link href="/gizlilik" className="hover:text-white transition-colors">Gizlilik Politikası</Link>
          <Link href="/sozlesmeler" className="hover:text-white transition-colors">Sözleşmeler</Link>
          <Link href="/iletisim" className="hover:text-white transition-colors">İletişim</Link>
        </div>
      </div>
    </footer>
  );
}
