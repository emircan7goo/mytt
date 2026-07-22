'use client';
import { useState } from 'react';
import { FileText, ShieldAlert, BadgeInfo, Scale, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type TabKey = 'b2c-sales' | 'b2c-info' | 'b2b-dealer' | 'consumer-rights';

export default function SozlesmelerPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('b2c-sales');

  const tabs = [
    {
      id: 'b2c-sales' as TabKey,
      label: 'Mesafeli Satış Sözleşmesi',
      icon: Scale,
      title: 'Mesafeli Satış Sözleşmesi (B2C)',
      description: 'Alıcı ile Satıcı (Bayi) arasındaki mesafeli satış kuralları.',
      content: `
### 1. TARAFLAR
**SATICI (BAYİ):** Ürünü listeleyen ve satan, üye olan B2B Yetkili Mağazası.
**ALICI (TÜKETİCİ):** "mytt" platformu üzerinden sipariş oluşturan gerçek kişi.
**ARACI HİZMET SAĞLAYICI:** Mytt Teknoloji A.Ş. (Platform sağlayıcı olup, satıcı konumunda değildir).

### 2. KONU
İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait "mytt" web sitesi üzerinden elektronik ortamda siparişini verdiği aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.

### 3. ÖDEME VE ESCROW GÜVENCESİ
*   ALICI tarafından yapılan ödemeler, Mytt Güvenli Ödeme (Escrow) hesabında toplanır.
*   Cihaz ALICI'ya ulaştıktan ve ALICI tarafından onaylandıktan (veya kargo tesliminden itibaren 48 saat geçtikten) sonra ödeme SATICI'ya aktarılır.
*   Bu süre içinde iade talebi oluşturulursa, ücret Escrow hesabında bloke edilir.

### 4. İADE VE CAYMA HAKKI
Tüketici, 14 gün içinde hiçbir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. İkinci el elektronik ürünlerde cayma hakkının kullanılabilmesi için cihazın teslim alındığı kozmetik durumda (değişiklik, parça değişimi veya fiziksel hasar olmaksızın) iade edilmesi şarttır.
      `
    },
    {
      id: 'b2c-info' as TabKey,
      label: 'Ön Bilgilendirme Formu',
      icon: BadgeInfo,
      title: 'Ön Bilgilendirme Formu',
      description: 'Sipariş öncesi bilgilendirme yükümlülükleri.',
      content: `
### ÖN BİLGİLENDİRME ŞARTLARI
İşbu Ön Bilgilendirme Formu'nun amacı, ALICI'ya mesafeli satış sözleşmesi kurulmadan önce mevzuat gereği verilmesi gereken temel bilgileri sağlamaktır.

*   **Ürün Nitelikleri:** Satın alınan cihazın markası, modeli, hafıza kapasitesi, pil sağlığı yüzdesi ve kozmetik durumu (A+, A, B, C) ürün detay sayfasında belirtildiği gibidir.
*   **Fiyat ve Kargo:** İlan edilen fiyatlar satış fiyatıdır. Tüm siparişlerde kargo ücretsizdir.
*   **Cayma Hakkı Süresi:** Cayma hakkı süresi, cihazın ALICI'ya teslim edildiği gün başlar ve 14 gündür.
*   **Şikayet ve Çözüm:** ALICI şikayetlerini öncelikle Mytt Destek Merkezi üzerinden iletebilir. Uyuşmazlık durumunda Tüketici Hakem Heyetleri yetkilidir.
      `
    },
    {
      id: 'b2b-dealer' as TabKey,
      label: 'Bayi Üyelik Sözleşmesi',
      icon: FileText,
      title: 'B2B Bayi Üyelik Sözleşmesi',
      description: 'Sitede satış yapan bayilerin (telefoncuların) sorumlulukları ve kuralları.',
      content: `
### B2B BAYİ ÜYELİK VE HİZMET ŞARTLARI

### 1. TANIMLAR VE KABUL
İşbu sözleşme, "mytt" platformunda mağaza açarak teklif veren ve cihaz satan B2B Bayileri ile Mytt Teknoloji A.Ş. arasında akdedilmiştir. Sisteme üye olan her bayi bu şartları kabul etmiş sayılır.

### 2. BAYİ YÜKÜMLÜLÜKLERİ VE IMEI KONTROLÜ
*   **Cihaz Kaydı:** Bayi, platforma yüklediği tüm cihazların IMEI numaralarını eksiksiz ve doğru girmek zorundadır.
*   **Güvenlik Garantisi:** Bayi, çalıntı, klonlanmış veya BTK tarafından kaydı kapatılmış cihazları listelemeyeceğini taahhüt eder. Sistem tarafından yakalanan çalıntı cihazlardan bayi hukuken ve cezai olarak tek başına sorumludur.
*   **Komisyon Oranı:** Mytt, başarılı satışlar üzerinden %5 oranında (veya kampanya dönemlerinde belirlenen oranda) hizmet komisyonu tahsil eder.
*   **Fiziki İnceleme:** Bayi, satın aldığı cihazları teslim almadan önce fiziksel ve teknik kontrollerini yapmakla yükümlüdür.

### 3. İPTAL VE MAĞAZA KAPATMA
Güven ihlali, sahte cihaz listeleme veya yanlış kozmetik grade beyanı durumunda mağaza tek taraflı olarak askıya alınır ve içerideki Escrow bakiyeleri yasal süreç tamamlanana kadar bloke edilir.
      `
    },
    {
      id: 'consumer-rights' as TabKey,
      label: 'İade & Tüketici Hakları',
      icon: ShieldAlert,
      title: 'Tüketici Hakları ve İade Koşulları',
      description: 'Garanti, iade prosedürleri ve tüketici hakem heyetleri süreçleri.',
      content: `
### TÜKETİCİ HAKLARI VE İADE PROSEDÜRLERİ

### 1. 6 AY GARANTİ KAPSAMI
"mytt" üzerinden satılan tüm yenilenmiş cihazlar, satıcı bayinin güvencesiyle en az 6 ay boyunca parça ve işçilik garantisi altındadır. Kullanıcı hatası (sıvı teması, ekran kırılması, darbe vb.) dışındaki tüm teknik arızalar ücretsiz onarılır veya cihaz değişimi yapılır.

### 2. İADE SÜRECİ
*   İade edilmek istenen cihazlar, gönderilen kutu, fatura ve aksesuarlarıyla birlikte gönderilmelidir.
*   Kullanıcı şifreleri kaldırılmalı, iCloud / Google hesap çıkışları yapılmış olmalıdır. Hesap çıkışı yapılmayan cihazlar güvenlik nedeniyle iade alınamaz.
*   Kargo gönderimi sırasında sistem tarafından üretilen ücretsiz iade kargo kodu kullanılmalıdır.
      `
    }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];
  const IconComponent = activeTabData.icon;

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-[14px]">
            <ArrowLeft size={16} strokeWidth={2.5} />
            Ana Sayfaya Dön
          </Link>
        </div>

        {/* Title */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-heading font-black text-slate-900 text-[36px] md:text-[48px] tracking-tight leading-none mb-4">
            Sözleşmeler & Formlar
          </h1>
          <p className="text-slate-500 font-medium text-[16px] max-w-2xl">
            Mytt platformundaki B2C alıcı hakları, B2B bayi sözleşmeleri, ön bilgilendirme formları ve yasal regülasyonlar hakkında tüm dökümanlara buradan ulaşabilirsiniz.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl text-[14px] font-black text-left transition-all ${
                    isSelected 
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 border-emerald-500' 
                      : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900 border-transparent'
                  } border`}
                >
                  <TabIcon size={20} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Card */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <IconComponent size={20} strokeWidth={2.5} />
                  </div>
                  <h2 className="font-heading font-black text-slate-900 text-[20px] md:text-[24px]">
                    {activeTabData.title}
                  </h2>
                </div>
                <p className="text-slate-500 text-[13px] font-medium pl-13">
                  {activeTabData.description}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[12px] font-black px-4 py-2 rounded-xl border border-amber-100 self-start sm:self-center">
                Yasal Metin
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 md:p-8 max-h-[60vh] overflow-y-auto hide-scrollbar">
              <div className="prose prose-slate max-w-none text-[15px] font-medium text-slate-600 leading-relaxed whitespace-pre-line">
                {activeTabData.content.trim()}
              </div>
            </div>
            
            {/* Card Footer */}
            <div className="p-6 md:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[12px] font-medium text-slate-400 text-center sm:text-left">
                Son Güncelleme: 16 Temmuz 2026 | Sürüm: v10.0-Elite
              </div>
              <button 
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[13px] font-black rounded-xl transition-all shadow-sm shrink-0"
              >
                Yazdır veya PDF Kaydet
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
