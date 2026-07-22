import {
  Controller, Get, Patch, Body,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { UserService, UpdateProfileDto, ChangePasswordDto } from './user.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** GET /users/me — Profil bilgisini getir */
  @Get('me')
  @ApiOperation({ summary: 'Giriş yapan kullanıcının profilini getir' })
  getProfile(@Request() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  /** PATCH /users/me — İsim güncelle */
  @Patch('me')
  @ApiOperation({ summary: 'Profil bilgilerini güncelle (isim vb.)' })
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(req.user.id, dto);
  }

  /** PATCH /users/me/password — Şifre değiştir */
  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Şifre değiştir (mevcut şifre doğrulama ile)' })
  async changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    await this.userService.changePassword(req.user.id, dto);
    return { message: 'Şifreniz başarıyla güncellendi.' };
  }
}
