import { Module } from '@nestjs/common';
import { BtkService } from './btk.service';

@Module({
  providers: [BtkService],
  exports: [BtkService],
})
export class BtkModule {}
