import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { IsOptional, IsString, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

// ── Profil güncelleme DTO ─────────────────────────────────────────────────────
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(80)
  name?: string;

  @IsOptional() @IsString() @MaxLength(20)
  phone?: string;
}

// ── Şifre güncelleme DTO ──────────────────────────────────────────────────────
export class ChangePasswordDto {
  @IsString() @MinLength(1)
  currentPassword!: string;

  @IsString() @MinLength(6)
  newPassword!: string;
}

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Profil getir ───────────────────────────────────────────────────────────
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, email: true, name: true,
        companyName: true, taxId: true,
        b2bStatus: true, commissionRate: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı');
    return user;
  }

  // ── Profil güncelle ────────────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data:  { ...(dto.name && { name: dto.name }) },
      select: { id: true, email: true, name: true, b2bStatus: true, commissionRate: true },
    });
  }

  // ── Şifre güncelle ─────────────────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new BadRequestException('Kullanıcı bulunamadı');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) throw new BadRequestException('Mevcut şifre hatalı');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data:  { password: hashed },
    });
  }
}
