import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Global() // Tüm modüllerde import'suz kullanılabilir
@Module({
  controllers: [MailController],
  providers:   [MailService],
  exports:     [MailService],
})
export class MailModule {}
