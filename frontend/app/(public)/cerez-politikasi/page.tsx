import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası | Mytt',
  description: 'Mytt platformunun kullandığı çerezler ve yönetimi hakkında bilgi.',
  robots: { index: true, follow: true },
};

export default function CerezPolitikasiPage() {
  return (
    <main className="min-h-screen bg-[var(--k-canvas)] pt-[100px] pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-[var(--k-ink)] mb-2 tracking-tight">
          Çerez Politikası
        </h1>
        <p className="text-[var(--k-ink-4)] text-sm mb-10">
          Platformumuz hangi çerezleri neden kullanır?
        </p>

        <div className="prose prose-zinc max-w-none space-y-8 text-[var(--k-ink-2)] text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">Çerez Nedir?</h2>
            <p>
              Çerezler, ziyaret ettiğiniz web sitelerinin tarayıcınıza yerleştirdiği küçük
              metin dosyalarıdır. Oturum yönetimi, tercih hatırlama ve kullanım analizi gibi
              amaçlarla kullanılır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">Kullandığımız Çerezler</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-[var(--k-surface-3)] text-[var(--k-ink-2)]">
                    <th className="text-left p-3 font-semibold rounded-tl-lg">Çerez Adı</th>
                    <th className="text-left p-3 font-semibold">Tür</th>
                    <th className="text-left p-3 font-semibold">Süre</th>
                    <th className="text-left p-3 font-semibold rounded-tr-lg">Amaç</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--k-line)]">
                  <tr>
                    <td className="p-3 font-mono text-xs">jwt</td>
                    <td className="p-3">Zorunlu</td>
                    <td className="p-3">15 dakika</td>
                    <td className="p-3">Kimlik doğrulama erişim token&apos;ı (HttpOnly)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">jwt_refresh</td>
                    <td className="p-3">Zorunlu</td>
                    <td className="p-3">7 gün</td>
                    <td className="p-3">Oturumu yenilemek için refresh token (HttpOnly)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">mytt-cart</td>
                    <td className="p-3">İşlevsel</td>
                    <td className="p-3">Tarayıcı kapanana kadar</td>
                    <td className="p-3">Sepet içeriğini kaydetme (localStorage)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">_ga, _gid</td>
                    <td className="p-3">Analitik</td>
                    <td className="p-3">2 yıl / 24 saat</td>
                    <td className="p-3">Google Analytics ziyaretçi sayımı</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono text-xs">cookie_consent</td>
                    <td className="p-3">Zorunlu</td>
                    <td className="p-3">1 yıl</td>
                    <td className="p-3">Çerez tercih kaydı</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">Zorunlu Çerezler</h2>
            <p>
              <strong>jwt</strong> ve <strong>jwt_refresh</strong> çerezleri oturum güvenliği için
              zorunludur ve devre dışı bırakılamaz. Bu çerezler HttpOnly olarak ayarlanmıştır;
              JavaScript ile erişilemez, bu da XSS saldırılarına karşı ek koruma sağlar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">Analitik Çerezler</h2>
            <p>
              Google Analytics 4 çerezleri, ziyaretçi davranışlarını anonim olarak analiz etmek
              için kullanılır. Bu çerezleri tarayıcı ayarlarınızdan veya aşağıdaki tercih
              bölümünden devre dışı bırakabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--k-ink)] mb-3">Çerez Tercihlerinizi Yönetin</h2>
            <p>
              Tarayıcınızın ayarlar menüsünden çerezleri silebilir veya engelleyebilirsiniz.
              Zorunlu çerezlerin engellenmesi platformun düzgün çalışmamasına neden olabilir.
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener" className="text-[var(--k-ink)] underline underline-offset-2">Chrome</a></li>
              <li><a href="https://support.mozilla.org/tr/kb/cerezleri-silme" target="_blank" rel="noopener" className="text-[var(--k-ink)] underline underline-offset-2">Firefox</a></li>
              <li><a href="https://support.apple.com/tr-tr/105082" target="_blank" rel="noopener" className="text-[var(--k-ink)] underline underline-offset-2">Safari</a></li>
            </ul>
          </section>

          <p className="text-[var(--k-ink-4)] text-xs pt-6 border-t border-[var(--k-line)]">
            Son güncelleme: Nisan 2025
          </p>
        </div>
      </div>
    </main>
  );
}
