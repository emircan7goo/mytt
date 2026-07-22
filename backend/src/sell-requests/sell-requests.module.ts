import { Module } from '@nestjs/common';
import { SellRequestsController } from './sell-requests.controller';
import { SellRequestsService } from './sell-requests.service';
import { SellRequestsScheduler } from './sell-requests.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [SellRequestsController],
  providers: [SellRequestsService, SellRequestsScheduler],
  exports: [SellRequestsService],
})
export class SellRequestsModule {}
