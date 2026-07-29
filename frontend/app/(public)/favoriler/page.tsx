import Link from 'next/link';
import { Heart, ArrowRight } from 'lucide-react';

export default function FavorilerPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[900px] mx-auto bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-200">
          <Heart size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Favori Listeniz Henüz Boş</h1>
          <p className="text-slate-500 text-sm font-medium">Beğendiğiniz cihazları kalbe tıklayarak favorilerinize ekleyebilirsiniz.</p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md transition-all"
        >
          <span>Ürünleri İncele</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
