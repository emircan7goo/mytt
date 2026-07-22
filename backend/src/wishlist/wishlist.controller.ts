import {
  Controller, Get, Post, Delete, Param,
  UseGuards, Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  /** GET /wishlist — tam favori listesi */
  @Get()
  @ApiOperation({ summary: 'Favori listesini getir' })
  async getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  /** GET /wishlist/ids — sadece ID listesi (hızlı kalp kontrolü) */
  @Get('ids')
  @ApiOperation({ summary: 'Favori ürün ID listesi' })
  async getIds(@Req() req: any) {
    return this.wishlistService.getWishlistIds(req.user.id);
  }

  /** POST /wishlist/:dealerStockId — favorilere ekle */
  @Post(':dealerStockId')
  @ApiOperation({ summary: 'Ürünü favorilere ekle' })
  async add(@Param('dealerStockId') dealerStockId: string, @Req() req: any) {
    return this.wishlistService.addToWishlist(req.user.id, dealerStockId);
  }

  /** DELETE /wishlist/:dealerStockId — favorilerden çıkar */
  @Delete(':dealerStockId')
  @ApiOperation({ summary: 'Ürünü favorilerden çıkar' })
  async remove(@Param('dealerStockId') dealerStockId: string, @Req() req: any) {
    return this.wishlistService.removeFromWishlist(req.user.id, dealerStockId);
  }
}
