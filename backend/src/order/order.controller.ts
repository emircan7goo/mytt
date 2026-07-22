import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/order.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * POST /orders — Müşteri sipariş oluşturur
   * Hem CUSTOMER hem DEALER alışveriş yapabilir (kendi ürünü hariç)
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a new order (escrow payment)' })
  async createOrder(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.orderService.createOrder(req.user.id, dto);
  }

  /**
   * GET /orders/my — Alıcı kendi siparişlerini görür
   */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my orders as buyer' })
  async getMyOrders(@Request() req: any) {
    return this.orderService.getMyOrdersAsBuyer(req.user.id);
  }

  /**
   * GET /orders/dealer — Bayi kendi aldığı siparişleri görür
   */
  @Get('dealer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get orders received as a dealer' })
  async getDealerOrders(@Request() req: any) {
    return this.orderService.getMyOrdersAsDealer(req.user.id);
  }

  /**
   * GET /orders — Admin tüm siparişleri görür
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: list all orders' })
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  // ── KARGO AKIŞ ENDPOINT'LERİ ─────────────────────────────────────────────────

  /**
   * PATCH /orders/:id/dealer-ship — Bayi kargo kodunu girer
   * Akış Adım 1: Müşteri ödedi → Bayi kargolar → Merkeze gidiyor
   */
  @Patch(':id/dealer-ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bayi: Merkeze kargo kodu girer (DEALER_SHIPPED)' })
  async dealerShip(
    @Param('id') id: string,
    @Body('trackingCode') trackingCode: string,
    @Request() req: any,
  ) {
    return this.orderService.dealerUpdateTracking(id, req.user.id, trackingCode);
  }

  /**
   * PATCH /orders/:id/warehouse-receive — Merkez teslim alır
   * Akış Adım 2: Kargo merkeze ulaştı
   */
  @Patch(':id/warehouse-receive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Merkeze teslim alındı (WAREHOUSE_RECEIVED)' })
  async warehouseReceive(@Param('id') id: string, @Request() req: any) {
    return this.orderService.warehouseReceive(id, req.user.id);
  }

  /**
   * PATCH /orders/:id/inspection-pass — Admin denetimi geçirir
   * Akış Adım 3: Cihaz kontrol edildi, sorun yok
   */
  @Patch(':id/inspection-pass')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Denetim geçti (INSPECTION_PASSED)' })
  async inspectionPass(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: any,
  ) {
    return this.orderService.adminPassInspection(id, req.user.id, notes);
  }

  /**
   * PATCH /orders/:id/admin-ship — Admin müşteriye kargolar
   * Akış Adım 4: Cihaz müşteriye yollandı
   */
  @Patch(':id/admin-ship')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Müşteriye kargolandı (ADMIN_SHIPPED)' })
  async adminShip(
    @Param('id') id: string,
    @Body('trackingCode') trackingCode: string,
    @Request() req: any,
  ) {
    return this.orderService.adminShipToCustomer(id, req.user.id, trackingCode);
  }

  /**
   * PATCH /orders/:id/delivered — Müşteri teslim aldı + Escrow serbest
   * Akış Adım 5: Son adım — ödeme bayiye aktarılır
   */
  @Patch(':id/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Teslim onayı + Escrow serbest (DELIVERED)' })
  async markDelivered(@Param('id') id: string, @Request() req: any) {
    return this.orderService.markDelivered(id, req.user.id);
  }

  // ── MEVCUT ADMIN ENDPOINT'LER ────────────────────────────────────────────────

  /**
   * PATCH /orders/:id/release — Admin escrow'u manuel serbest bırakır
   */
  @Patch(':id/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: release escrow — pay dealer (manual)' })
  async releaseEscrow(@Param('id') id: string, @Request() req: any) {
    return this.orderService.releaseEscrow(id, req.user.id);
  }

  /**
   * PATCH /orders/:id/refund — Admin iade kararı
   */
  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: refund order — restore stock' })
  async refundOrder(@Param('id') id: string, @Request() req: any) {
    return this.orderService.refundOrder(id, req.user.id);
  }
}
