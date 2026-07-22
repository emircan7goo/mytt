import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { CreateStoreDto, UpdateStoreDto } from './dto/store.dto';
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

@ApiTags('stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('premium')
  @ApiOperation({ summary: 'Get premium/sponsored stores' })
  @ApiResponse({ status: 200, description: 'List of premium stores.' })
  async getPremiumStores() {
    return this.storeService.findPremium();
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby stores using geolocation' })
  @ApiQuery({
    name: 'lat',
    type: Number,
    required: true,
    description: 'Latitude',
  })
  @ApiQuery({
    name: 'lng',
    type: Number,
    required: true,
    description: 'Longitude',
  })
  @ApiQuery({
    name: 'radius',
    type: Number,
    required: true,
    description: 'Radius in kilometers',
  })
  @ApiResponse({ status: 200, description: 'List of nearby stores.' })
  async getNearbyStores(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('radius') radius: number,
  ) {
    // Basic validation
    if (!lat || !lng || !radius) {
      return { error: 'lat, lng, and radius are required' };
    }
    return this.storeService.findNearby(
      Number(lat),
      Number(lng),
      Number(radius),
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DEALER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new store (Dealer only)' })
  @ApiResponse({ status: 201, description: 'Store successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createStore(
    @Body() createStoreDto: CreateStoreDto,
    @Request() req: any,
  ) {
    return this.storeService.create(req.user.id, createStoreDto);
  }

  /** Oturumdaki bayinin kendi mağazası — mağaza yoksa null döner */
  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current dealer own store' })
  async getMyStore(@Request() req: any) {
    return this.storeService.findByOwner(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific store' })
  @ApiResponse({ status: 200, description: 'Store details.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  async getStore(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update your store profile' })
  @ApiResponse({ status: 200, description: 'Store successfully updated.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  async updateStore(
    @Param('id') storeId: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req: any,
  ) {
    // storeService should verify if the store belongs to the user
    return this.storeService.update(storeId, req.user.id, updateStoreDto);
  }
}
