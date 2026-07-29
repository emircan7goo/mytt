import Link from 'next/link';
import { Store, ShieldCheck, MapPin, Star, ArrowRight } from 'lucide-react';

const DEALERS = [
  { id: 1, name: 'Kadıköy Yetkili İletişim', city: 'İstanbul / Kadıköy', rating: '4.9', sales: '1.420+ Satış', badge: 'TSE Onaylı Bayi' },
  { id: 2, name: 'Şişli Premium Bilişim', city: 'İstanbul / Şişli', rating: '4.8', sales: '980+ Satış', badge: 'Kurumsal Mağaza' },
  { id: 3, name: 'Beşiktaş Cihaz Dünyası', city: 'İstanbul / Beşiktaş', rating: '4.9', sales: '2.100+ Satış', badge: 'TSE Onaylı Bayi' },
  { id: 4, name: 'Çankaya Tekno Pazarı', city: 'Ankara / Çankaya', rating: '4.7', sales: '750+ Satış', badge: 'Kurumsal Mağaza' },
  { id: 5, name: 'Karşıyaka Dijital Mağaza', city: 'İzmir / Karşıyaka', rating: '4.9', sales: '1.850+ Satış', badge: 'TSE Onaylı Bayi' },
  { id: 6, name: 'Nilüfer İletişim Merkezi', city: 'Bursa / Nilüfer', rating: '4.8', sales: '620+ Satış', badge: 'Kurumsal Mağaza' },
];

export default function MagazalarPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[1200px] mx-auto space-y-10">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs tracking-wider uppercase border border-orange-200">
            ONAYLI 150+ BAYİ AĞI
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Doğrulanmış <span className="text-orange-600">Yetkili Bayi Pazaryeri</span>
          </h1>
          <p className="text-slate-600 text-base font-medium leading-relaxed">
            Türkiye genelinde TSE standartlarında hizmet veren, ticaret odası kayıtlı onaylı yetkili bayilerimizi inceleyin.
          </p>
        </div>

        {/* Mağazalar Izgarası */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEALERS.map((d) => (
            <div key={d.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-orange-400 transition-all space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
                    <Store size={24} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                    {d.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{d.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
                    <MapPin size={14} className="text-slate-400" />
                    <span>{d.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs font-bold">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} className="fill-amber-400" />
                    <span>{d.rating}</span>
                  </div>
                  <span className="text-slate-600">{d.sales}</span>
                </div>
              </div>

              <Link
                href="/sell"
                className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-800 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Teklif İste</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
