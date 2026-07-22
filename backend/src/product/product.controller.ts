import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateCampaignDto } from './dto/product.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  /**
   * Public ürün listesi — Filtreler ve sıralama destekli
   */
  @Get()
  @ApiOperation({ summary: 'List all public products for the catalog (anonymous — no dealer identity)' })
  @ApiQuery({ name: 'brand',      required: false, description: 'Brand filter (e.g. Apple, Samsung)' })
  @ApiQuery({ name: 'condition',  required: false, enum: ['NEW', 'SECOND_HAND'] })
  @ApiQuery({ name: 'minPrice',   required: false, type: Number })
  @ApiQuery({ name: 'maxPrice',   required: false, type: Number })
  @ApiQuery({ name: 'grade',      required: false, description: 'Cosmetic grade from specsJson (A+, A, B)' })
  @ApiQuery({ name: 'batteryMin', required: false, type: Number, description: 'Min battery health (e.g. 85)' })
  @ApiQuery({ name: 'sort',       required: false, enum: ['price_asc', 'price_desc', 'newest', 'sponsored'] })
  @ApiQuery({ name: 'search',     required: false, description: 'Full-text search on brand + model' })
  @ApiResponse({ status: 200, description: 'List of public products.' })
  async getAllPublicProducts(
    @Query('brand')      brand?: string,
    @Query('condition')  condition?: string,
    @Query('minPrice')   minPriceStr?: string,
    @Query('maxPrice')   maxPriceStr?: string,
    @Query('grade')      grade?: string,
    @Query('batteryMin') batteryMinStr?: string,
    @Query('sort')       sort?: 'price_asc' | 'price_desc' | 'newest' | 'sponsored',
    @Query('search')     search?: string,
  ) {
    return this.productService.findAllPublic({
      brand,
      condition: condition as 'NEW' | 'SECOND_HAND' | undefined,
      minPrice:    minPriceStr    ? parseFloat(minPriceStr)  : undefined,
      maxPrice:    maxPriceStr    ? parseFloat(maxPriceStr)  : undefined,
      grade,
      batteryMin:  batteryMinStr  ? parseInt(batteryMinStr)  : undefined,
      sort,
      search,
    });
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products of the authenticated dealer' })
  async getMyProducts(@Request() req: any) {
    return this.productService.findMyProducts(req.user.id);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'List products of a specific store' })
  @ApiResponse({ status: 200, description: 'List of products.' })
  async getStoreProducts(@Param('storeId') storeId: string) {
    return this.productService.findByStore(storeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product by ID (anonymous — no dealer identity exposed)' })
  @ApiResponse({ status: 200, description: 'Product detail.' })
  @ApiResponse({ status: 404, description: 'Not found.' })
  async getProductById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a new product to your store (Dealer only)' })
  @ApiResponse({ status: 201, description: 'Product successfully added.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async addProduct(
    @Body() createProductDto: CreateProductDto,
    @Request() req: any,
  ) {
    return this.productService.create(req.user.id, createProductDto);
  }

  @Patch(':id/campaign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set or update campaign details on a product (Dealer only)' })
  @ApiResponse({ status: 200, description: 'Campaign updated.' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() dto: UpdateCampaignDto,
    @Request() req: any,
  ) {
    return this.productService.updateCampaign(id, req.user.id, dto);
  }
}
