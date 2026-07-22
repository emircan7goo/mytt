import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseUUIDPipe, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, PayoutStatus } from '@prisma/client';
import { PayoutService } from './payout.service';

@ApiTags('payout')
@ApiBearerAuth()
@Controller('payout')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayoutController {
  constructor(private readonly service: PayoutService) {}

  // ── Bayi ─────────────────────────────────────────────────────────────────

  @Get('my-earnings')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Hakediş özeti — bekleyen / çekilebilir bakiye' })
  myEarnings(@Request() req: any) {
    return this.service.getEarnings(req.user.id);
  }

  @Get('my-requests')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Kendi çekim taleplerinin geçmişi' })
  myRequests(@Request() req: any) {
    return this.service.getMyPayouts(req.user.id);
  }

  @Post('request')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Çekim talebi oluştur' })
  request(
    @Request() req: any,
    @Body('amount') amount: number | undefined,
    @Body('iban') iban: string,
    @Body('ibanName') ibanName: string | undefined,
  ) {
    return this.service.requestPayout(req.user.id, { amount, iban, ibanName });
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tüm çekim taleplerini listele' })
  @ApiQuery({ name: 'status', required: false, enum: PayoutStatus })
  adminList(@Query('status') status?: PayoutStatus) {
    return this.service.adminList(status);
  }

  @Patch('admin/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Talebi onayla (havale bekleniyor)' })
  adminApprove(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.adminApprove(id, req.user.id);
  }

  @Patch('admin/:id/paid')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Havale yapıldı, ödendi olarak işaretle' })
  adminMarkPaid(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('note') note?: string,
  ) {
    return this.service.adminMarkPaid(id, req.user.id, note);
  }

  @Patch('admin/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Talebi reddet' })
  adminReject(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('note') note?: string,
  ) {
    if (!note?.trim()) throw new BadRequestException('Reddetme gerekçesi zorunludur.');
    return this.service.adminReject(id, req.user.id, note);
  }
}
