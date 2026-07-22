import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { ProductModule } from './product/product.module';
import { AdminModule } from './admin/admin.module';
import { OrderModule } from './order/order.module';
import { HeroModule } from './hero/hero.module';
import { CatalogModule } from './catalog/catalog.module';
import { SiteConfigModule } from './site-config/site-config.module';
import { UploadModule } from './upload/upload.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentModule } from './payment/payment.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mail/mail.module';
import { SellRequestsModule } from './sell-requests/sell-requests.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { DealerMarketModule } from './dealer-market/dealer-market.module';
import { BtkModule } from './btk/btk.module';
import { PayoutModule } from './payout/payout.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Cron job desteği
    // Rate limiting — 200 istek / 60 saniye
    ThrottlerModule.forRoot([
      {
        ttl:   60_000,
        limit: 200, // Admin paneli için yeterli istek sayısı
      },
    ]),
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_DIR || join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    StoreModule,
    ProductModule,
    AdminModule,
    OrderModule,
    HeroModule,    // ← Hero Slider
    CatalogModule, // ← Global Katalog + Bayi Stok + Stok Talepleri
    SiteConfigModule, // ← Wix-Style Site Builder & Config
    UploadModule,     // ← Görsel yükleme (admin)
    TicketModule,     // ← Bayi destek talepleri
    PaymentModule,    // ← PayTR ödeme entegrasyonu
    MailModule,          // ← Global email servisi
    SellRequestsModule,  // ← Cihaz Sat — Müşteri→Bayi açık artırma sistemi
    WishlistModule,      // ← Favori listesi (kalıcı, DB tabanlı)
    DealerMarketModule,  // ← Bayiler Arası Cihaz Paslaşma
    BtkModule,           // ← BTK IMEI Doğrulama Altyapısı
    PayoutModule,        // ← Bayi Hakediş Çekim Sistemi
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide:  APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
