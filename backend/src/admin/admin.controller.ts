import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CatalogService } from '../catalog/catalog.service';
import { ApplicationStatus, Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly catalogService: CatalogService,
  ) {}

  // ── Bayi Başvuruları ──────────────────────────────────────────────────────────

  @Get('dealer-applications')
  @ApiOperation({ summary: 'Bekleyen bayi başvurularını listele' })
  async getPendingApplications() {
    return this.adminService.getPendingDealerApplications();
  }

  @Patch('dealer-applications/:id')
  @ApiOperation({ summary: 'Bayi başvurusunu onayla veya reddet' })
  async updateApplicationStatus(
    @Param('id') id: string,
    @Body('status') status: ApplicationStatus,
    @Req() req: any,
  ) {
    return this.adminService.updateDealerApplicationStatus(id, status, req.user.id);
  }

  // ── Metrikler ve Analitik ─────────────────────────────────────────────────────

  @Get('metrics')
  @ApiOperation({ summary: 'Platform geneli özet metrikler' })
  async getPlatformMetrics() {
    return this.adminService.getPlatformMetrics();
  }

  @Get('dealers')
  @ApiOperation({ summary: 'Tüm bayilerin analitik listesi' })
  async getDealerAnalytics() {
    return this.adminService.getDealerAnalytics();
  }

  // ── Kullanıcı Yönetimi (Yeni — Mock'un yerini alır) ──────────────────────────

  @Get('users')
  @ApiOperation({ summary: '[Admin] Tüm müşteri ve bayileri listele' })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/commission')
  @ApiOperation({ summary: '[Admin] Bayi komisyon oranını güncelle (% olarak gönder)' })
  async updateCommission(
    @Param('id') id: string,
    @Body('commissionRate') commissionRate: number,
    @Req() req: any,
  ) {
    return this.adminService.updateUserCommission(id, commissionRate, req.user.id);
  }

  @Patch('users/:id/ban')
  @ApiOperation({ summary: '[Admin] Kullanıcıyı banla veya aktif et' })
  async toggleBan(@Param('id') id: string, @Req() req: any) {
    return this.adminService.toggleUserBan(id, req.user.id);
  }

  // ── Destek Talepleri ──────────────────────────────────────────────────────────

  @Get('tickets')
  @ApiOperation({ summary: 'Tüm destek taleplerini listele' })
  async getAllTickets() {
    return this.adminService.getAllTickets();
  }

  @Patch('tickets/:id/reply')
  @ApiOperation({ summary: 'Talebe cevap yaz' })
  async replyToTicket(
    @Param('id') id: string,
    @Body('adminReply') adminReply: string,
    @Req() req: any,
  ) {
    return this.adminService.replyToTicket(id, adminReply, req.user.id);
  }

  @Patch('tickets/:id/close')
  @ApiOperation({ summary: 'Talebi kapat' })
  async closeTicket(@Param('id') id: string, @Req() req: any) {
    return this.adminService.closeTicket(id, req.user.id);
  }

  // ── Anlaşmazlık Yönetimi ─────────────────────────────────────────────────────

  @Get('disputes')
  @ApiOperation({ summary: 'Tüm anlaşmazlıkları listele' })
  async getDisputes() {
    return this.adminService.getDisputes();
  }

  @Post('disputes/:id/open')
  @ApiOperation({ summary: 'Siparişe anlaşmazlık aç' })
  async openDispute(
    @Param('id') id: string,
    @Body('type') type: string,
    @Body('note') note?: string,
  ) {
    return this.adminService.openDispute(id, type, note);
  }

  @Patch('disputes/:id/status')
  @ApiOperation({ summary: 'Anlaşmazlık durumunu güncelle' })
  async updateDisputeStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('note') note: string,
    @Req() req: any,
  ) {
    return this.adminService.updateDisputeStatus(id, status, note, req.user.id);
  }

  // ── Stok Talepleri ────────────────────────────────────────────────────────────

  @Get('stock-requests')
  @ApiOperation({ summary: '[Admin] Tüm bayi stok taleplerini listele' })
  async getStockRequests() {
    return this.catalogService.getAllStockRequests();
  }

  @Patch('stock-requests/:id')
  @ApiOperation({ summary: '[Admin] Stok talebi durumunu güncelle' })
  async updateStockRequest(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.catalogService.updateStockRequestStatus(id, status);
  }

  // ── Sipariş Yönetimi ─────────────────────────────────────────────────────────

  @Get('orders')
  @ApiOperation({ summary: '[Admin] Tüm siparişleri listele' })
  async getAllOrders() {
    return this.adminService.getAllOrders();
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: '[Admin] Sipariş ödeme durumunu güncelle' })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: string,
    @Req() req: any,
  ) {
    return this.adminService.updateOrderStatus(id, paymentStatus, req.user.id);
  }

  // ── Aktivite Logu ────────────────────────────────────────────────────────

  @Get('activity-log')
  @ApiOperation({ summary: '[Admin] Sistem aktivite loglarını listele' })
  async getActivityLog() {
    return this.adminService.getActivityLogs();
  }

  // ── Bayi Bakiye Yönetimi ────────────────────────────────────────────────

  @Get('dealers/wallet-list')
  @ApiOperation({ summary: '[Admin] Tüm bayileri bakiye bilgisiyle listele' })
  async getDealersWithWallet() {
    return this.adminService.getDealersWithWallet();
  }

  @Patch('dealers/:id/wallet')
  @ApiOperation({ summary: '[Admin] Bayi bakiyesini güncelle (set veya add)' })
  async updateDealerWallet(
    @Param('id') id: string,
    @Body('amount') amount: number,
    @Body('mode') mode: 'set' | 'add' = 'set',
    @Req() req: any,
  ) {
    return this.adminService.updateDealerWallet(id, Number(amount), mode, req.user.id);
  }

  // ── Onay Merkezi ─────────────────────────────────────────────────────────────

  /** Tüm onay bekleyenleri tek endpoint'te döndür */
  @Get('pending-approvals')
  @ApiOperation({ summary: '[Admin] Onay bekleyen tüm kayıtlar (sell requests + dealer stocks + market items)' })
  async getPendingApprovals() {
    return this.adminService.getPendingApprovals();
  }

  /** Müşteri satış talebi onayla */
  @Patch('sell-requests/:id/approve')
  @ApiOperation({ summary: '[Admin] Müşteri satış talebini onayla (bayilere açılır)' })
  async approveSellRequest(
    @Param('id') id: string,
    @Body('adminNote') adminNote: string,
    @Req() req: any,
  ) {
    return this.adminService.approveSellRequest(id, adminNote, req.user.id);
  }

  /** Müşteri satış talebi reddet */
  @Patch('sell-requests/:id/reject')
  @ApiOperation({ summary: '[Admin] Müşteri satış talebini reddet' })
  async rejectSellRequest(
    @Param('id') id: string,
    @Body('adminNote') adminNote: string,
    @Req() req: any,
  ) {
    return this.adminService.rejectSellRequest(id, adminNote, req.user.id);
  }

  /** Bayi stok girişi onayla */
  @Patch('dealer-stock/:id/approve')
  @ApiOperation({ summary: '[Admin] Bayi stok girişini onayla (marketplace\'de görünür)' })
  async approveDealerStock(
    @Param('id') id: string,
    @Body('adminNote') adminNote: string,
    @Req() req: any,
  ) {
    return this.adminService.approveDealerStock(id, adminNote, req.user.id);
  }

  /** Bayi stok girişi reddet */
  @Patch('dealer-stock/:id/reject')
  @ApiOperation({ summary: '[Admin] Bayi stok girişini reddet' })
  async rejectDealerStock(
    @Param('id') id: string,
    @Body('adminNote') adminNote: string,
    @Req() req: any,
  ) {
    return this.adminService.rejectDealerStock(id, adminNote, req.user.id);
  }
}
