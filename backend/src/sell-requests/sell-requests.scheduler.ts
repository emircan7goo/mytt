import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SellRequestsService } from './sell-requests.service';

/**
 * SellRequestsScheduler
 *
 * Her dakika çalışır ve süresi dolmuş PENDING talepleri EXPIRED'a alır.
 * Müşterilere "teklifler kapandı, en iyi teklif şu kadar" emaili gönderir.
 */
@Injectable()
export class SellRequestsScheduler {
  private readonly logger = new Logger(SellRequestsScheduler.name);

  constructor(private readonly sellRequestsService: SellRequestsService) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'expire-sell-requests' })
  async handleExpiry(): Promise<void> {
    try {
      await this.sellRequestsService.runScheduledExpiry();
    } catch (err) {
      this.logger.error('[Cron] Expire job başarısız:', err?.message ?? err);
    }
  }
}
