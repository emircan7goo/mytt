import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Request, Query, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard }  from '../auth/guards/jwt-auth.guard';
import { RolesGuard }    from '../auth/guards/roles.guard';
import { Roles }         from '../auth/decorators/roles.decorator';
import { Role, DealerMarketStatus } from '@prisma/client';
import { DealerMarketService }      from './dealer-market.service';
import { CreateListingDto }         from './dto/create-listing.dto';
import { PlaceMarketBidDto }        from './dto/place-market-bid.dto';

@ApiTags('dealer-market')
@ApiBearerAuth()
@Controller('dealer-market')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DealerMarketController {
  constructor(private readonly svc: DealerMarketService) {}

  // ── Bayi: İlan Oluştur ────────────────────────────────────────────────────
  @Post()
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Cihaz ilan ver (admin onayı beklenir)' })
  create(@Request() req: any, @Body() dto: CreateListingDto) {
    return this.svc.createListing(req.user.id, dto);
  }

  // ── Bayi: Kendi İlanlarım ─────────────────────────────────────────────────
  @Get('my')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Kendi ilanlarım' })
  myListings(@Request() req: any) {
    return this.svc.findMyListings(req.user.id);
  }

  // ── Bayi: Aktif Marketplace ───────────────────────────────────────────────
  @Get()
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Aktif ilanları listele' })
  activeListings(@Request() req: any) {
    return this.svc.findActiveListings(req.user.id);
  }

  // ── Bayi: Teklif Ver ──────────────────────────────────────────────────────
  @Post(':id/bid')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Teklif ver / güncelle' })
  placeBid(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PlaceMarketBidDto,
  ) {
    return this.svc.placeBid(req.user.id, id, dto);
  }

  // ── Bayi: Direkt Satın Al ─────────────────────────────────────────────────
  @Post(':id/buy')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Bayi] Sabit fiyatlı ilanı satın al' })
  buyDirect(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.buyDirect(req.user.id, id);
  }

  // ── Satıcı Bayi: Teklifi Kabul Et ────────────────────────────────────────
  @Post(':id/accept-bid/:bidId')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Satıcı Bayi] Teklifi kabul et' })
  acceptBid(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('bidId', ParseUUIDPipe) bidId: string,
  ) {
    return this.svc.acceptBid(req.user.id, id, bidId);
  }

  // ── Satıcı Bayi: İptal Et ─────────────────────────────────────────────────
  @Delete(':id')
  @Roles(Role.DEALER)
  @ApiOperation({ summary: '[Satıcı Bayi] İlanı iptal et' })
  cancel(@Request() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.svc.cancelListing(req.user.id, id);
  }

  // ── Admin ──────────────────────────────────────────────────────────────────
  @Get('admin')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tüm ilanlar' })
  @ApiQuery({ name: 'status', required: false, enum: DealerMarketStatus })
  adminList(@Query('status') status?: DealerMarketStatus) {
    return this.svc.findAll(status);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] Tekil ilan tam detay' })
  adminOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.svc.findOneAdmin(id);
  }

  @Patch('admin/:id/approve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] İlanı onayla' })
  adminApprove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.svc.adminApprove(id, adminNote);
  }

  @Patch('admin/:id/reject')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[Admin] İlanı reddet' })
  adminReject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.svc.adminReject(id, adminNote);
  }
}
