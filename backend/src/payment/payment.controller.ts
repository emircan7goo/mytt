import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Ip,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { PaytrCallbackBody, StartCheckoutDto } from './payment.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  IsString, IsNumber, IsNotEmpty, IsOptional, Min, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── DTO — frontend'den gelen checkout başlatma isteği ────────────────────────
class StartCheckoutRequestDto {
  @IsString() @IsNotEmpty()
  productId!: string;

  @IsInt() @Min(1) @Type(() => Number)
  quantity!: number;

  @IsString() @IsNotEmpty()
  shippingAddress!: string;

  @IsString() @IsNotEmpty()
  productName!: string;

  @IsNumber() @Min(0.01) @Type(() => Number)
  amount!: number;
}

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * POST /payment/start-checkout
   * Giriş yapmış müşteri → sipariş oluşturur + PayTR token alır
   * Frontend bu token ile iframe'i render eder
   */
  @Post('start-checkout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ödeme başlat — sipariş oluştur + PayTR iframe token al' })
  async startCheckout(
    @Body() dto: StartCheckoutRequestDto,
    @Request() req: any,
    @Headers('x-forwarded-for') forwardedFor?: string,
    @Ip() ip?: string,
  ) {
    const user = req.user;

    if (!user?.email) {
      throw new BadRequestException('Kullanıcı bilgisi eksik');
    }

    // Gerçek kullanıcı IP'sini al (proxy arkasında X-Forwarded-For)
    const userIp = (forwardedFor?.split(',')[0]?.trim()) ?? ip ?? '127.0.0.1';

    const checkoutDto: StartCheckoutDto = {
      productId:       dto.productId,
      quantity:        dto.quantity,
      shippingAddress: dto.shippingAddress,
      userEmail:       user.email,
      userName:        user.name ?? user.email,
      userIp,
      productName:     dto.productName,
      amount:          dto.amount,
    };

    return this.paymentService.startCheckout(user.id, checkoutDto);
  }

  /**
   * POST /payment/paytr-callback
   * PayTR bu endpoint'i çağırır — public (auth yok)
   * Ödeme sonucunu işler → sipariş durumunu günceller
   * PayTR'ın beklediği yanıt: "OK" (plain text)
   */
  @Post('paytr-callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'PayTR ödeme sonucu callback (PayTR tarafından çağrılır)' })
  async paytrCallback(@Body() body: PaytrCallbackBody): Promise<string> {
    const result = await this.paymentService.handlePaytrCallback(body);
    // PayTR "OK" yanıtı almazsa callback'i tekrar tekrar gönderir
    return result;
  }
}
