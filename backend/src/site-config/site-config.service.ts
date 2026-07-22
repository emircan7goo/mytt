import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_FEATURE_CARDS = [
  {
    id: 'sell',
    enabled: true,
    title: 'Cihazını Sat',
    description: 'Yüzlerce yetkili bayi cihazın için kapalı teklifte yarışır. En yüksek teklifi onayla, kargola, paranı al.',
    badgeText: '1 Saatte Teklif',
    tag: 'Ücretsiz',
    features: [
      'Bayiler birbirinin teklifini göremez',
      'Cihaz kargosuz teslim edilir',
      'Ödeme garanti ile yapılır',
    ],
    stat: '150+',
    statLabel: 'Aktif Bayi',
    ctaText: 'Başla',
  },
  {
    id: 'ai-finder',
    enabled: true,
    title: 'AI Telefon Bulucu',
    description: 'Bütçenizi ve kullanım alışkanlıklarınızı analiz edip size özel en iyi 3 cihazı anında listeleyelim.',
    badgeText: 'YZ Destekli',
    tag: 'Saniyeler içinde',
    features: [
      'Bütçe & ihtiyaç analizi yapılır',
      'Kişiye özel 3 cihaz önerilir',
      'Anlık fiyat karşılaştırması',
    ],
    stat: '3',
    statLabel: 'Kişisel Öneri',
    ctaText: 'Hemen Bul',
  },
  {
    id: 'trade-in',
    enabled: true,
    title: 'Trade-In Hesaplayıcı',
    description: 'Eski telefonunuzun güncel piyasa değerini öğrenin, yeni cihazınızı çok daha uygun fiyata alın.',
    badgeText: 'Anlık Fiyat',
    tag: 'Ücretsiz',
    features: [
      'Güncel piyasa fiyatı gösterilir',
      'Yeni cihazda doğrudan indirim',
      'Güvenli & hızlı takas işlemi',
    ],
    stat: '%40',
    statLabel: 'a kadar tasarruf',
    ctaText: 'Değerini Öğren',
  },
];

const DEFAULT_SETTINGS = {
  ticker: "🏆 Türkiye'nin En Güvenilir Yenilenmiş Telefon Pazarı  |  🎉 Vade Farksız 9 Taksit İmkânı  |  ✅ 21 Nokta Kalite Kontrol  |  🚀 Aynı Gün Kargo  |  💎 TSE Onaylı Premium Cihazlar",
  trustBar: [
    { icon: 'ShieldCheck', title: '12 Ay Garanti', desc: 'Tüm cihazlarda tam güvence.' },
    { icon: 'Truck', title: 'Aynı Gün Kargo', desc: 'Saat 14:00\'e kadar olan siparişler.' },
    { icon: 'Recycle', title: 'Eskiyi Getir', desc: 'En iyi takas değerini verelim.' }
  ],
  categories: [
    { name: 'Apple', icon: 'https://www.apple.com/ac/globalnav/7/tr_TR/images/be15095f-5a20-57d0-ad14-cf4c638e223a/globalnav_apple_image__b5er5ngrzxqq_large.svg' },
    { name: 'Samsung', icon: 'https://brand.samsung.com/content/dam/samsung/us/logo/Samsung_Wordmark_Black.svg' },
    { name: 'Xiaomi', icon: null },
    { name: 'Tabletler', icon: null },
    { name: 'Aksesuarlar', icon: null }
  ],
  serviceBubbles: [
    { id: 1, title1: 'Vade Farksız', title2: '9 Taksit!', iconUrl: '', link: '/?promo=taksit', bg: 'indigo' },
    { id: 2, title1: 'İndirimli Paket', title2: 'Ürünler!', iconUrl: '', link: '/?promo=paket', bg: 'rose' },
    { id: 3, title1: 'Sıfır', title2: 'Telefonlar', iconUrl: '', link: '/?cat=S%C4%B1f%C4%B1r', bg: 'emerald' },
    { id: 4, title1: 'Kaçmaz', title2: 'Fiyatlar!', iconUrl: '', link: '/?promo=kampanya', bg: 'amber' },
    { id: 5, title1: 'Akıllı', title2: 'Eşleştirme', iconUrl: '', link: '/secim-asistani', bg: 'sky' },
    { id: 6, title1: 'Mytt', title2: 'Güvencesi', iconUrl: '', link: '/garanti', bg: 'violet' },
    { id: 7, title1: 'Mağazadan', title2: 'Teslim Al', iconUrl: '', link: '/magazalar', bg: 'fuchsia' },
    { id: 8, title1: 'Sıkça Sorulan', title2: 'Sorular', iconUrl: '', link: '/yardim', bg: 'teal' }
  ],
  featureCards: DEFAULT_FEATURE_CARDS,
};

@Injectable()
export class SiteConfigService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const config = await this.prisma.siteConfig.findUnique({
      where: { id: 'singleton' }
    });

    // Kayıt hiç yoksa varsayılanlarla oluştur — mevcut kayıt ASLA ezilmez
    if (!config) {
      return this.prisma.siteConfig.create({
        data: { id: 'singleton', settings: DEFAULT_SETTINGS }
      });
    }

    // Kayıt var ama eski şemadan eksik alanlar içerebilir → sadece eksik alanları doldur
    const settings = config.settings as any;
    const needsMerge =
      !settings?.serviceBubbles ||
      !settings?.trustBar       ||
      !settings?.categories     ||
      !settings?.featureCards;

    if (needsMerge) {
      const merged = { ...DEFAULT_SETTINGS, ...settings };
      return this.prisma.siteConfig.update({
        where: { id: 'singleton' },
        data: { settings: merged }
      });
    }

    return config;
  }

  async updateConfig(newSettings: any) {
    return this.prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        settings: newSettings
      },
      update: {
        settings: newSettings
      }
    });
  }
}
