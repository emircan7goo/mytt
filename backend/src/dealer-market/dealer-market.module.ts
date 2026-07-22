import { Module } from '@nestjs/common';
import { DealerMarketController } from './dealer-market.controller';
import { DealerMarketService }    from './dealer-market.service';
import { PrismaModule }           from '../prisma/prisma.module';

@Module({
  imports:     [PrismaModule],
  controllers: [DealerMarketController],
  providers:   [DealerMarketService],
  exports:     [DealerMarketService],
})
export class DealerMarketModule {}
