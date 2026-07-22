import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  ParseIntPipe, DefaultValuePipe, ParseBoolPipe, BadRequestException,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import {
  CreateGlobalProductDto,
  UpdateGlobalProductDto,
  CreateDealerStockDto,
  UpdateDealerStockDto,
  CreateStockRequestDto,
} from './dto/catalog.dto';
import {
  ApiTags, ApiOperation, ApiQuery,
  ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ────────────────────────────────────────────────────────────────────────────
  // Global Katalog — PUBLIC + ADMIN
  // ────────────────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List global product catalog with optional filters' })
  @ApiQuery({ name: 'brand',    required: false })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async getCatalog(
    @Query('brand')    brand?: string,
    @Query('search')   search?: string,
    @Query('isActive') isActiveStr?: string,
  ) {
    const isActive = isActiveStr !== undefined
      ? isActiveStr !== 'false'
      : undefined;
    return this.catalogService.findAllGlobal({ brand, search, isActive });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Public gruplu vitrin — bir model, altında tüm bayi tekliflerinin özeti
  // (":id" route'undan ÖNCE tanımlanmalı, aksi halde "/browse" bir id sanılır)
  // ────────────────────────────────────────────────────────────────────────────
  @Get('browse')
  @ApiOperation({ summary: 'Public grouped browsing — one card per model, anonymous dealer offers aggregated' })
  @ApiQuery({ name: 'brand',      required: false })
  @ApiQuery({ name: 'search',     required: false })
  @ApiQuery({ name: 'grade',      required: false, enum: ['A+', 'A', 'B', 'C'] })
  @ApiQuery({ name: 'batteryMin', required: false, type: Number })
  @ApiQuery({ name: 'minPrice',   required: false, type: Number })
  @ApiQuery({ name: 'maxPrice',   required: false, type: Number })
  @ApiQuery({ name: 'hasBox',     required: false, type: Boolean })
  @ApiQuery({ name: 'hasInvoice', required: false, type: Boolean })
  @ApiQuery({ name: 'sort',       required: false, enum: ['price_asc', 'price_desc', 'best_condition', 'newest', 'popular'] })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  async browse(
    @Query('brand')      brand?: string,
    @Query('search')     search?: string,
    @Query('grade')      grade?: string,
    @Query('batteryMin') batteryMinStr?: string,
    @Query('minPrice')   minPriceStr?: string,
    @Query('maxPrice')   maxPriceStr?: string,
    @Query('hasBox')     hasBoxStr?: string,
    @Query('hasInvoice') hasInvoiceStr?: string,
    @Query('sort')       sort?: 'price_asc' | 'price_desc' | 'best_condition' | 'newest' | 'popular',
    @Query('page',  new DefaultValuePipe(1),   ParseIntPipe) page:  number = 1,
    @Query('limit', new DefaultValuePipe(200), ParseIntPipe) limit: number = 200,
  ) {
    return this.catalogService.findBrowseGrouped({
      brand,
      search,
      grade,
      batteryMin: batteryMinStr ? parseInt(batteryMinStr) : undefined,
      minPrice:   minPriceStr   ? parseFloat(minPriceStr) : undefined,
      maxPrice:   maxPriceStr   ? parseFloat(maxPriceStr) : undefined,
      hasBox:     hasBoxStr     !== undefined ? hasBoxStr     !== 'false' : undefined,
      hasInvoice: hasInvoiceStr !== undefined ? hasInvoiceStr !== 'false' : undefined,
      sort,
      page,
      limit,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Public model ailesi detayı — "tüm iPhone 12'ler" karşılaştırma sayfası
  // (":id" route'undan ÖNCE tanımlanmalı)
  // ────────────────────────────────────────────────────────────────────────────
  @Get('family')
  @ApiOperation({ summary: 'Public: a brand+model family — all storage/color variants and all dealer offers together' })
  @ApiQuery({ name: 'brand',      required: true })
  @ApiQuery({ name: 'model',      required: true })
  @ApiQuery({ name: 'sort',       required: false, enum: ['price_asc', 'price_desc', 'best_condition'] })
  @ApiQuery({ name: 'storage',    required: false })
  @ApiQuery({ name: 'grade',      required: false, enum: ['A+', 'A', 'B', 'C'] })
  @ApiQuery({ name: 'batteryMin', required: false, type: Number })
  @ApiQuery({ name: 'minPrice',   required: false, type: Number })
  @ApiQuery({ name: 'maxPrice',   required: false, type: Number })
  async family(
    @Query('brand')      brand?: string,
    @Query('model')      model?: string,
    @Query('sort')       sort?: 'price_asc' | 'price_desc' | 'best_condition',
    @Query('storage')    storage?: string,
    @Query('grade')      grade?: string,
    @Query('batteryMin') batteryMinStr?: string,
    @Query('minPrice')   minPriceStr?: string,
    @Query('maxPrice')   maxPriceStr?: string,
  ) {
    if (!brand || !model) throw new BadRequestException('brand ve model parametreleri zorunlu.');
    return this.catalogService.findFamilyDetail(brand, model, {
      sort,
      storage,
      grade,
      batteryMin: batteryMinStr ? parseInt(batteryMinStr) : undefined,
      minPrice:   minPriceStr   ? parseFloat(minPriceStr) : undefined,
      maxPrice:   maxPriceStr   ? parseFloat(maxPriceStr) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single global product with dealer stock list' })
  @ApiQuery({ name: 'sort', required: false, enum: ['price_asc', 'price_desc', 'best_condition'] })
  async getGlobalProduct(
    @Param('id') id: string,
    @Query('sort') sort?: 'price_asc' | 'price_desc' | 'best_condition',
  ) {
    return this.catalogService.findGlobalById(id, sort);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Add a product to the global catalog' })
  async createGlobal(@Body() dto: CreateGlobalProductDto) {
    return this.catalogService.createGlobal(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a global catalog product' })
  async updateGlobal(@Param('id') id: string, @Body() dto: UpdateGlobalProductDto) {
    return this.catalogService.updateGlobal(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Remove a product from the catalog' })
  async removeGlobal(@Param('id') id: string) {
    return this.catalogService.removeGlobal(id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Bayi Stok — filtrelenmiş public liste
  // ────────────────────────────────────────────────────────────────────────────

  @Get('stock/admin-all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get ALL dealer stock with IMEI and dealer images' })
  @ApiQuery({ name: 'brand',  required: false })
  @ApiQuery({ name: 'grade',  required: false, enum: ['A+', 'A', 'B', 'C'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  async getAllStockAdmin(
    @Query('brand')  brand?: string,
    @Query('grade')  grade?: string,
    @Query('search') search?: string,
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.catalogService.findAllStockAdmin({ brand, grade, search, page, limit });
  }

  @Get('stock/list')
  @ApiOperation({ summary: 'Filtered dealer stock list (public, IMEI hidden)' })
  @ApiQuery({ name: 'brand',      required: false })
  @ApiQuery({ name: 'grade',      required: false, enum: ['A+', 'A', 'B'] })
  @ApiQuery({ name: 'batteryMin', required: false, type: Number })
  @ApiQuery({ name: 'minPrice',   required: false, type: Number })
  @ApiQuery({ name: 'maxPrice',   required: false, type: Number })
  @ApiQuery({ name: 'hasBox',     required: false, type: Boolean })
  @ApiQuery({ name: 'hasInvoice', required: false, type: Boolean })
  @ApiQuery({ name: 'sort',       required: false, enum: ['price_asc','price_desc','grade_asc','newest'] })
  @ApiQuery({ name: 'page',       required: false, type: Number })
  @ApiQuery({ name: 'limit',      required: false, type: Number })
  async getFilteredStock(
    @Query('brand')      brand?: string,
    @Query('grade')      grade?: string,
    @Query('batteryMin') batteryMinStr?: string,
    @Query('minPrice')   minPriceStr?: string,
    @Query('maxPrice')   maxPriceStr?: string,
    @Query('hasBox')     hasBoxStr?: string,
    @Query('hasInvoice') hasInvoiceStr?: string,
    @Query('sort')       sort?: 'price_asc' | 'price_desc' | 'grade_asc' | 'newest',
    @Query('page',  new DefaultValuePipe(1),  ParseIntPipe) page:  number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.catalogService.findFilteredStock({
      brand,
      grade,
      batteryMin:  batteryMinStr  ? parseInt(batteryMinStr)  : undefined,
      minPrice:    minPriceStr    ? parseFloat(minPriceStr)  : undefined,
      maxPrice:    maxPriceStr    ? parseFloat(maxPriceStr)  : undefined,
      hasBox:      hasBoxStr     !== undefined ? hasBoxStr     !== 'false' : undefined,
      hasInvoice:  hasInvoiceStr !== undefined ? hasInvoiceStr !== 'false' : undefined,
      sort,
      page,
      limit,
    });
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Bayi Stok — kendi kayıtları
  // ────────────────────────────────────────────────────────────────────────────

  @Get('stock/public/:id')
  @ApiOperation({ summary: 'Get single dealer stock publicly' })
  async getPublicStockById(@Param('id') id: string) {
    return this.catalogService.findDealerStockById(id);
  }

  @Get('stock/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Get my stock entries' })
  async getMyStock(@Request() req: any) {
    return this.catalogService.findMyStock(req.user.id);
  }

  @Post('stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Add a stock entry from the global catalog' })
  @ApiResponse({ status: 201, description: 'Stock entry created.' })
  async addStock(@Request() req: any, @Body() dto: CreateDealerStockDto) {
    return this.catalogService.addDealerStock(req.user.id, dto);
  }

  @Patch('stock/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Update own stock entry' })
  async updateStock(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDealerStockDto,
  ) {
    return this.catalogService.updateDealerStock(req.user.id, id, dto);
  }

  @Delete('stock/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Remove own stock entry' })
  async removeStock(@Request() req: any, @Param('id') id: string) {
    return this.catalogService.removeDealerStock(req.user.id, id);
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Stok Talepleri
  // ────────────────────────────────────────────────────────────────────────────

  @Post('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Submit a stock request for an unlisted model' })
  async createRequest(@Request() req: any, @Body() dto: CreateStockRequestDto) {
    return this.catalogService.createStockRequest(req.user.id, dto);
  }

  @Get('requests/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dealer] Get my stock requests' })
  async getMyRequests(@Request() req: any) {
    return this.catalogService.getMyStockRequests(req.user.id);
  }

  @Get('requests/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all stock requests' })
  async getAllRequests() {
    return this.catalogService.getAllStockRequests();
  }

  @Patch('requests/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update stock request status' })
  async updateRequestStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.catalogService.updateStockRequestStatus(id, status);
  }
}
