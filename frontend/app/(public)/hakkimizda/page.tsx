import Link from 'next/link';
import { Building2, ShieldCheck, Users, Target, ArrowRight } from 'lucide-react';

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-[var(--k-canvas-2)] py-12 px-4 lg:px-8">
      <div className="max-w-[1100px] mx-auto space-y-12">

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-[var(--k-hot-wash)] text-[var(--k-hot)] font-extrabold text-xs tracking-wider uppercase border border-[var(--k-line-hot)]">
            TÜRKİYE'NİN LİDER CİHAZ PAZARYERİ
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--k-ink)] leading-tight">
            Geleceğin Güvenli <span className="text-[var(--k-hot)]">Teknoloji Ticareti</span>
          </h1>
          <p className="text-[var(--k-ink-2)] text-base font-medium leading-relaxed">
            Mytt; sıfır ve yenilenmiş teknoloji ürünlerinde alıcı ve satıcıları TSE standartlarında güvenli kapalı açık artırma havuzunda buluşturan lider pazaryeridir.
          </p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-[var(--k-surface)] p-6 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-[var(--k-hot)]">150+</div>
            <div className="text-xs font-bold text-[var(--k-ink-2)] uppercase">Onaylı Yetkili Bayi</div>
          </div>
          <div className="bg-[var(--k-surface)] p-6 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-[var(--k-hot)]">25.000+</div>
            <div className="text-xs font-bold text-[var(--k-ink-2)] uppercase">Tamamlanan İşlem</div>
          </div>
          <div className="bg-[var(--k-surface)] p-6 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-[var(--k-hot)]">%99.8</div>
            <div className="text-xs font-bold text-[var(--k-ink-2)] uppercase">Müşteri Memnuniyeti</div>
          </div>
          <div className="bg-[var(--k-surface)] p-6 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-2">
            <div className="text-3xl sm:text-4xl font-black text-[var(--k-hot)]">12 Ay</div>
            <div className="text-xs font-bold text-[var(--k-ink-2)] uppercase">TSE Garanti Desteği</div>
          </div>
        </div>

        {/* Misyon & Vizyon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--k-hot)] text-[var(--k-hot-ink)] flex items-center justify-center shadow-md">
              <Target size={24} />
            </div>
            <h3 className="text-xl font-black text-[var(--k-ink)]">Misyonumuz</h3>
            <p className="text-[var(--k-ink-2)] text-xs font-medium leading-relaxed">
              İkinci el ve yenilenmiş cihaz alım-satımındaki güvensizlik ortamını tamamen ortadan kaldırmak; şeffaf ekspertiz ve rekabetçi açık artırma modeliyle kullanıcılara en yüksek değeri sunmak.
            </p>
          </div>

          <div className="bg-[var(--k-surface)] p-8 rounded-3xl border border-[var(--k-line)] shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-xl font-black text-[var(--k-ink)]">Vizyonumuz</h3>
            <p className="text-[var(--k-ink-2)] text-xs font-medium leading-relaxed">
              Türkiye ve bölgenin en büyük sertifikalı teknoloji pazaryeri olarak döngüsel ekonomiye katkıda bulunmak ve her yıl binlerce cihazı yeniden ekonomiye kazandırmak.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
