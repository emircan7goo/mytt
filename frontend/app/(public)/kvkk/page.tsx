import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kişisel Verilerin Korunması (KVKK) | Mytt',
  description: 'Mytt platformu KVKK aydınlatma metni — 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri işleme politikamız.',
  robots: { index: true, follow: true },
};

export default function KVKKPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pt-[100px] pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
          Kişisel Verilerin Korunması
        </h1>
        <p className="text-zinc-400 text-sm mb-10">
          6698 Sayılı Kişisel Verilerin Korunması Kanunu — KVKK Aydınlatma Metni
        </p>

        <div className="prose prose-zinc max-w-none space-y-8 text-zinc-700 text-[15px] leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Veri Sorumlusu</h2>
            <p>
              Mytt platformu olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;)
              kapsamında kişisel verilerinizin işlenmesinden sorumlu veri sorumlusu sıfatıyla hareket
              etmekteyiz. Bu metin, kişisel verilerinizin nasıl toplandığını, işlendiğini ve
              korunduğunu açıklamak amacıyla hazırlanmıştır.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. İşlenen Kişisel Veriler</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Kimlik Bilgileri:</strong> Ad, soyad</li>
              <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası</li>
              <li><strong>Finansal Bilgiler:</strong> Sipariş tutarı, ödeme durumu (kart bilgileri Mytt tarafından saklanmaz; PayTR güvencesindedir)</li>
              <li><strong>İşlem Bilgileri:</strong> Satın alma geçmişi, sipariş detayları</li>
              <li><strong>Cihaz ve Teknik Veriler:</strong> IP adresi, tarayıcı tipi, çerez bilgileri</li>
              <li><strong>B2B Bayi Bilgileri:</strong> Vergi numarası, firma adı, ticari belgeler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Sipariş oluşturma, yönetimi ve teslim süreçlerinin yürütülmesi</li>
              <li>Kullanıcı hesabının oluşturulması ve kimlik doğrulaması</li>
              <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
              <li>Müşteri destek hizmetlerinin sunulması</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Platform güvenliğinin sağlanması ve sahteciliğin önlenmesi</li>
              <li>Pazarlama ve iletişim faaliyetleri (açık rıza ile)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Hukuki Dayanak</h2>
            <p>Kişisel verileriniz aşağıdaki hukuki dayanaklar kapsamında işlenmektedir:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Sözleşmenin ifası (KVKK Madde 5/2-c)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi (KVKK Madde 5/2-ç)</li>
              <li>Meşru menfaat (KVKK Madde 5/2-f)</li>
              <li>Açık rıza (pazarlama iletişimleri için — KVKK Madde 5/1)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Veri Güvenliği</h2>
            <p>
              Kişisel verilerinizin güvenliğini sağlamak amacıyla uygun teknik ve idari önlemler
              uygulanmaktadır. Şifreler bcrypt ile hashlenmekte, erişim token&apos;ları HttpOnly
              çerezlerde saklanmakta ve tüm iletişim HTTPS/TLS üzerinden gerçekleştirilmektedir.
              Ödeme bilgileri Mytt sunucularında saklanmamakta; PCI-DSS uyumlu PayTR altyapısı
              tarafından işlenmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Veri Saklama Süresi</h2>
            <p>
              Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca veya ilgili
              mevzuatta öngörülen süreler dolana kadar saklanmaktadır. Hesabınızı kapatmanız
              durumunda verileriniz, yasal saklama yükümlülükleri saklı kalmak kaydıyla
              silinmekte veya anonim hale getirilmektedir.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. KVKK Kapsamındaki Haklarınız</h2>
            <p>KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme</li>
              <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
              <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
              <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
              <li>Silinmesini veya yok edilmesini isteme</li>
              <li>İşlemenin otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize sonuç oluşmasına itiraz etme</li>
              <li>Hukuka aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
            </ul>
            <p className="mt-3">
              Haklarınızı kullanmak için{' '}
              <a href="mailto:kvkk@mytt.com.tr" className="text-zinc-900 underline underline-offset-2">
                kvkk@mytt.com.tr
              </a>{' '}
              adresine yazılı başvuruda bulunabilirsiniz.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Çerezler</h2>
            <p>
              Platform, oturum yönetimi ve deneyim iyileştirme amaçlarıyla çerezler kullanmaktadır.
              Detaylı bilgi için{' '}
              <a href="/cerez-politikasi" className="text-zinc-900 underline underline-offset-2">
                Çerez Politikamızı
              </a>{' '}
              inceleyebilirsiniz.
            </p>
          </section>

          <p className="text-zinc-400 text-xs pt-6 border-t border-zinc-100">
            Son güncelleme: Nisan 2025
          </p>
        </div>
      </div>
    </main>
  );
}
