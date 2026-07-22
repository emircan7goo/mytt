/**
 * SellRequestsController
 *
 * Endpoint Özeti:
 *
 *  MÜŞTERİ (JWT gerekmez hariç tarama, diğerleri gerekmez CUSTOMER/DEALER/ADMIN):
 *   POST   /sell-requests               → Yeni satış talebi oluştur
 *   GET    /sell-requests/my            → Kendi taleplerini listele
 *   GET    /sell-requests/my/:id        → Kendi talep detayı
 *   POST   /sell-requests/:id/accept-bid/:bidId → Teklifi kabul et
 *   POST   /sell-requests/:id/reject    → Tüm teklifleri reddet
 *   PATCH  /sell-requests/:id/shipping  → Kargo kodu gir
 *
 *  BAYİ (DEALER):
 *   GET    /sell-requests/dealer        → Aktif talepleri gör
 *   GET    /sell-requests/dealer/:id    → Talep detayı
 *   POST   /sell-requests/dealer/:id/bid → Teklif ver
 *
 *  ADMIN:
 *   GET    /sell-requests/admin         → Tümünü listele (filtreli)
 *   GET    /sell-requests/admin/stats   → İstatistikler
 *   GET    /sell-requests/admin/:id     → Tam detay (tüm teklifler görünür)
 *   PATCH  /sell-requests/admin/:id     → Durum/atama güncelle
 */
import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, Request, ParseUUIDPipe, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, SellRequestStatus } from '@prisma/client';
import { SellRequestsService } from './sell-requests.service';
import { CreateSellRequestDto } from './dto/create-sell-request.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { UpdateSellRequestDto } from './dto/update-sell-request.dto';

@ApiTags('sell-requests')
@ApiBearerAuth()
@Controller('sell-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SellRequestsController {
  constructor(private readonly service: SellRequestsService) {}

  // ── Müşteri Endpoint'leri ───────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: '[Müşteri] Yeni satış talebi oluştur' })
  create(@Request() req: any, @Body() dto: CreateSellRequestDto) {
    return this.service.create(req.user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: '[Müşteri] Kendi satış taleplerini listele' })
  findMy(@Request() req: any) {
    return this.service.findMyRequests(req.user.id);
  }

  @Get('my/:id')
  @ApiOperation({ summary: '[Müşteri] Kendi tekil talep detayı' })
  findMyOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findMyRequest(req.user.id, id);
  }

  @Post(':id/accept-bid/:bidId')
  @ApiOperation({ summary: '[Müşteri] Teklifi kabul et' })
  acceptBid(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bidId', ParseUUIDPipe) bidId: string,
  ) {
    return this.service.acceptBid(req.user.id, id, bidId);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: '[Müşteri] Tüm teklifleri reddet' })
  rejectAll(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.rejectAllBids(req.user.id, id);
  }

  @Patch(':id/shipping')
  @ApiOperation({ summary: '[Müşteri] Kargo takip kodu gir' })
  addShipping(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('shippingCode') shippingCode: string,
  ) {
    if (!shippingCode?.trim()) throw new BadRequestException('Kargo kodu boş olamaz.');
    return this.service.addShippingCode(req.user.id, id, shippingCode.trim());
  }

  // ── Bayi Endpoint'leri ─────────────────────────────────────────────────

  @Get('dealer')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Aktif satış taleplerini gör' })
  dealerList(@Request() req: any) {
    return this.service.findActiveForDealer(req.user.id);
  }

  @Get('dealer/:id')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Talep detayı' })
  dealerOne(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findRequestForDealer(req.user.id, id);
  }

  @Post('dealer/:id/bid')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Teklif ver / güncelle' })
  placeBid(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PlaceBidDto,
  ) {
    return this.service.placeBid(req.user.id, id, dto);
  }

  // ── Admin Endpoint'leri ────────────────────────────────────────────────

  @Get('admin/stats')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] İstatistikler' })
  stats() {
    return this.service.getStats();
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tüm talepleri listele' })
  @ApiQuery({ name: 'status', required: false, enum: SellRequestStatus })
  @ApiQuery({ name: 'skip',   required: false, type: Number })
  @ApiQuery({ name: 'take',   required: false, type: Number })
  adminList(
    @Query('status') status?: SellRequestStatus,
    @Query('skip')   skip?:   string,
    @Query('take')   take?:   string,
  ) {
    return this.service.findAll({
      status,
      skip: skip ? Number(skip) : 0,
      take: take ? Number(take) : 50,
    });
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tekil talep tam detay' })
  adminOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOneAdmin(id);
  }

  @Patch('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Talep durumunu / atamasını güncelle' })
  adminUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSellRequestDto,
  ) {
    return this.service.updateAdmin(id, dto);
  }
}
