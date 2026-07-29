import Link from 'next/link';
import { Building2, ShieldCheck, Users, Target, ArrowRight } from 'lucide-react';

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 lg:px-8">
      <div className="max-w-[1100px] mx-auto space-y-12">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-extrabold text-xs tracking-wider uppercase border border-orange-200">
            TÜRKİYE'NİN LİDER CİHAZ PAZARYERİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight">
            Geleceğin Güvenli <span className="text-orange-600">Teknoloji Ticareti</span>
          </h1>
          <p className="text-slate-600 text-base font-medium leading-relaxed">
            Mytt; sıfır ve yenilenmiş teknoloji ürünlerinde alıcı ve satıcıları TSE standartlarında güvenli kapalı açık artırma havuzunda buluşturan lider pazaryeridir.
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-orange-600">150+</div>
            <div className="text-xs font-bold text-slate-600 uppercase">Onaylı Yetkili Bayi</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-orange-600">25.000+</div>
            <div className="text-xs font-bold text-slate-600 uppercase">Tamamlanan İşlem</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-orange-600">%99.8</div>
            <div className="text-xs font-bold text-slate-600 uppercase">Müşteri Memnuniyeti</div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-orange-600">12 Ay</div>
            <div className="text-xs font-bold text-slate-600 uppercase">TSE Garanti Desteği</div>
          </div>
        </div>

        {/* Misyon & Vizyon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-md">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Misyonumuz</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              İkinci el ve yenilenmiş cihaz alım-satımındaki güvensizlik ortamını tamamen ortadan kaldırmak; şeffaf ekspertiz ve rekabetçi açık artırma modeliyle kullanıcılara en yüksek değeri sunmak.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-900">Vizyonumuz</h3>
            <p className="text-slate-600 text-xs font-medium leading-relaxed">
              Türkiye ve bölgenin en büyük sertifikalı teknoloji pazaryeri olarak döngüsel ekonomiye katkıda bulunmak ve her yıl binlerce cihazı yeniden ekonomiye kazandırmak.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
