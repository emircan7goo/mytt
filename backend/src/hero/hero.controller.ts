import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HeroService } from './hero.service';
import { CreateHeroSlideDto, UpdateHeroSlideDto } from './dto/hero.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('hero-slides')
@SkipThrottle()
@Controller('hero-slides')
export class HeroController {
  constructor(private readonly heroService: HeroService) {}

  /** ── PUBLIC ── Anasayfanın slide verisi (cache-friendly) */
  @Get()
  @ApiOperation({ summary: 'Get all active hero slides (public)' })
  @ApiResponse({ status: 200, description: 'List of active hero slides.' })
  async getActiveSlides() {
    return this.heroService.findAllActive();
  }

  /** ── ADMIN ── Tüm slide'lar (pasifler dahil) */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Get all hero slides including inactive' })
  async getAll() {
    return this.heroService.findAll();
  }

  /** ── ADMIN ── Yeni slide ekle */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Create a new hero slide' })
  @ApiResponse({ status: 201, description: 'Slide created.' })
  async create(@Body() dto: CreateHeroSlideDto) {
    return this.heroService.create(dto);
  }

  /** ── ADMIN ── Slide güncelle */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Update a hero slide' })
  async update(@Param('id') id: string, @Body() dto: UpdateHeroSlideDto) {
    return this.heroService.update(id, dto);
  }

  /** ── ADMIN ── Slide sil */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Delete a hero slide' })
  async remove(@Param('id') id: string) {
    return this.heroService.remove(id);
  }
}
