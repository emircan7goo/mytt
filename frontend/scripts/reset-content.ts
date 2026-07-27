import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function resetContent() {
  console.log('🔄 Cleaning & Updating Neon Database Content...');

  // 1. Hero slides update/reset
  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.create({
    data: {
      order: 0,
      title: 'Cihazını En Yüksek Fiyata Sat,\nYenisini Sıfır Riskle Al.',
      subtitle: 'Yetkili bayilerin yarıştığı kapalı teklif sistemiyle cihazını 1 saatte en yüksek fiyata sat. Ya da 12 ay garantili, 32 noktada test edilmiş cihazları Escrow güvencesiyle satın al.',
      btnLeftText: 'Cihazını Hemen Sat',
      btnLeftLink: '/sell',
      btnRightText: 'Garantili Cihazları İncele',
      btnRightLink: '/',
      textColor: '#0F172A',
      textAlignment: 'center',
      overlayOpacity: 0,
      isActive: true,
    },
  });

  // 2. SiteConfig update
  const defaultCards = [
    {
      id: 'sell',
      enabled: true,
      title: 'Cihazını Hemen Sat',
      description: 'Yetkili bayiler cihazın için 1 saat içinde kapalı tekliflerde yarışsın. En yüksek teklifi seç, ücretsiz kargola, paranı Escrow güvencesiyle anında al.',
      badgeText: 'Anında Kapalı Teklif',
      tag: 'Sıfır Komisyon',
      features: [
        'Şeffaf açık artırma teklifleri',
        'Ücretsiz kargo & kapıdan teslimat',
        '%100 Güvenli Escrow ödeme koruması',
      ],
      stat: '150+',
      statLabel: 'Onaylı Yetkili Bayi',
      ctaText: 'Teklif Al',
    },
    {
      id: 'ai-finder',
      enabled: true,
      title: 'Yapay Zekâ Akıllı Telefon Bulucu',
      description: 'Bütçenizi, kullanım alışkanlıklarınızı ve kamera/pil beklentilerinizi analiz edip size özel en uygun 3 ideal cihazı saniyeler içinde önerelim.',
      badgeText: 'YZ Akıllı Analiz',
      tag: 'Kişiye Özel',
      features: [
        'Kullanım profili analizi',
        'Fiyat / performans oranlaması',
        'Kişiselleştirilmiş 3 seçenek',
      ],
      stat: '3',
      statLabel: 'Size Özel Öneri',
      ctaText: 'Telefonumu Bul',
    },
    {
      id: 'trade-in',
      enabled: true,
      title: 'Eskiyi Getir, Yeniyi Al (Takas)',
      description: 'Eski telefonunuzun güncel piyasa değerini saniyeler içinde hesaplayın, yeni alacağınız cihazda doğrudan indirim avantajıyla hemen kullanın.',
      badgeText: 'Piyasa Değeri',
      tag: 'Anında İndirim',
      features: [
        'Canlı piyasa değerlemesi',
        'Cihaz fiyatından düşülen indirim',
        'Adresten hızlı değişim',
      ],
      stat: '%40',
      statLabel: 'Varan Takas İndirimi',
      ctaText: 'Değerini Hesapla',
    },
  ];

  const currentConfig = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  const settings = {
    ...(currentConfig?.settings as any || {}),
    featureCards: defaultCards,
    ticker: "🏆 Türkiye'nin En Güvenilir Doğrulanmış Cihaz Pazarı  |  🎉 Vade Farksız 12 Taksit İmkânı  |  ✅ 32 Nokta Kalite Kontrol  |  🚀 Aynı Gün Kargo  |  💎 TSE Onaylı Premium Cihazlar",
  };

  await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', settings },
    update: { settings },
  });

  console.log('✅ Neon DB Content Reset Successfully!');
}

resetContent().catch(console.error).finally(() => process.exit(0));
